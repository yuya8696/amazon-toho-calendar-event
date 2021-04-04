// 共通の変数
var CALENDAR = CalendarApp.getDefaultCalendar();

// amazonで注文した荷物のお届け日をカレンダーに登録
function createAmazonEvent() {
  var criteria = "is:unread subject:Amazon.co.jp ご注文の確認";
  var matchWords = /.曜日,\s\d{2}\/\d{2}/g;
  var dateTimeExp = /\d{2}\/\d{2}\s\d{2}:\d{2}/g; // ex. 06/15 16:00
  var dateTimeExpWithSubString = /(\d{2})\/(\d{2})\s(\d{2}):(\d{2})/; // ()をつけることで部分文字列として返却される
  var dateExp = /\d{2}\/\d{2}/g; // ex. 06/15 16:00
  var dateExpWithSubString = /(\d{2})\/(\d{2})/; // ()をつけることで部分文字列として返却される

  GmailApp.search(criteria).forEach(function(thread) {
    var messages = thread.getMessages();
    messages.forEach(function(message) {
      var body = message.getPlainBody(); //getBodyだとHTMLメールのため

      //対象テキストが長すぎる場合はカット
      if (body.length > 2000) {
        body = body.slice(0, 2000);
      }

      if (!body.match(/お届け予定/)) {
        // Kindleの注文を除くため
        return;
      }
      Logger.log("body:   " + body);

      var year = message.getDate().getFullYear();
      var myArray = [];

      // 曜日と日付の表記が存在したらカレンダー登録を実行　ex. [土曜日, 06/08,土曜日, 06/08]
      if (body.match(matchWords)) {
        if (body.match(dateTimeExp)) {
          myArray = body.match(dateTimeExp); // ex. [06/15 16:00, 06/15 18:00]
          var [sMatched, sMonth, sDay, sHour, sMin] = myArray[0].match(
            dateTimeExpWithSubString
          );
          var [eMatched, eMonth, eDay, eHour, eMin] = myArray[1].match(
            dateTimeExpWithSubString
          );
          var startDate = new Date(year, sMonth - 1, sDay, sHour, sMin);
          var endDate = new Date(year, eMonth - 1, eDay, eHour, eMin);
          Logger.log("myArray:   " + myArray);
          if (body.match(/お届け先[\s\S]*?注文内容/)[0] != null) {
            var location = body
              .match(/お届け先[\s\S]*?注文内容/)[0]
              .replace("¥n", "")
              .replace("=", "");
          }
          CALENDAR.createEvent("Amazon荷物", startDate, endDate, {
            description: body,
            location: location
          });
          Logger.log(
            "開始日と終了日（時間も指定）, :   " + startDate + endDate
          );
        } else {
          body.match(matchWords).forEach(function(matchWord) {
            matchWord = matchWord.replace(/.曜日,\s/g, "");
            // Logger.log('matchWord:   ' + matchWord)
            myArray.push(matchWord);
          }); // ex. [06/15, 06/15]
          var [sMatched, sMonth, sDay] = myArray[0].match(dateExpWithSubString);
          var startDate = new Date(year, sMonth - 1, sDay);
          // Logger.log('myArray:   ' + myArray)
          if (body.match(/お届け先[\s\S]*?注文内容/)[0] != null) {
            var location = body
              .match(/お届け先[\s\S]*?注文内容/)[0]
              .replace("¥n", "")
              .replace("=", "");
          }
          // お届け日時が複数日にわたる場合
          if (myArray.length > 1) {
            var [eMatched, eMonth, eDay] = myArray[1].match(
              dateExpWithSubString
            );
            var endDate = new Date(year, eMonth - 1, eDay);
            CALENDAR.createAllDayEvent("Amazon荷物", startDate, endDate, {
              description: body,
              location: location
            });
            Logger.log("開始日と終了日, :   " + startDate + endDate);
          } else {
            CALENDAR.createAllDayEvent("Amazon荷物", startDate, {
              description: body,
              location: location
            });
            Logger.log("開始日だけ, :   " + startDate);
          }
        }
      }
      message.markRead();
    });
  });
}

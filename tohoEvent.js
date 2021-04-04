// TOHOで予約した映画の情報をカレンダーに登録
//参考ページ http://tomono.hatenadiary.com/entry/2016/11/19/105229
function createTohoEvent() {
  var criteria =
    "is:unread subject:【TOHO CINEMAS】インターネットチケット購入完了のお知らせ";

  GmailApp.search(criteria).forEach(function(thread) {
    var messages = thread.getMessages();
    var event_length = 120; // 映画時間を120分とする
    messages.forEach(function(message) {
      var body = message.getPlainBody(); //getBodyだとHTMLメールのため

      //対象テキストが長すぎる場合はカット
      if (body.length > 2000) {
        body = body.slice(0, 2000);
      }

      Logger.log("実行" + body)
      var id = body.match(/購入番号\D*(\d{4}).*/)[1];
                 Logger.log("購入番号: " + id);
      var date = body.match(/上映日\D*(\d+\/\d+\/\d+)\D*(\d+:\d+)/)[1];
                 Logger.log("上映日: " + date);
      var time = body.match(/上映日\D*(\d+\/\d+\/\d+)\D*(\d+:\d+)/)[2];
                 Logger.log("時間: " + time);
      var theater = body.match(/映画館\s*([^　]+)■作品名/)[1];
                 Logger.log("映画館: " + theater);
      var name = body.match(/作品名\s*([^　]+)■上映日/)[1];
                 Logger.log("作品名: " + name);

      var start_date_time = new Date(date + " " + time + ":00");
      var end_date_time = new Date(date + " " + time + ":00");
      end_date_time.setMinutes(start_date_time.getMinutes() + event_length);
      CALENDAR.createEvent(
        "[" + id + "]" + name,
        start_date_time,
        end_date_time,
        { description: body, location: theater }
      );
      message.markRead();
    });
  });
}

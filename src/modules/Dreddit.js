import { saito_lib, ModTemplate } from 'saito-lib'

export default class Dreddit extends ModTemplate {
  constructor(saito, dredditStore) {
    super()

    this.saito = saito
    this.dredditStore = dredditStore

    this.reddit            = {};
    this.reddit.firehose   = 1;   // 1 = show me everything
    this.reddit.posts_per_page = 30;

    this.name = "Dreddit";
  }

  initialize() {
    var subreddit = "";
    var post_id = "";
    var comment_id = "";
    var offset = 0;

    if (post_id == "") {
      let message                 = {};
      message.request         = "reddit load all";
      message.data            = {};
      message.data.request    = "reddit load all";
      message.data.subreddit  = subreddit;
      message.data.post_id    = post_id;
      message.data.comment_id = comment_id;
      message.data.offset     = offset;
      this.saito.network.sendRequest(message.request, message.data);
    }
  }


  handlePeerRequest(app, msg, peer, mycallback) {
    if (msg.request == null) { return; }
    if (msg.data == null) { return; }


    var tx = {}
    var newtx = {}

    console.log(msg.request)

    switch (msg.request) {
      case "reddit comment moderate":
        newtx = new saito_lib.transaction(msg.data.tx);
        this.addComment(newtx, msg);
        break;

      case "reddit load":
        newtx = new saito_lib.transaction(msg.data.tx);
        this.addPost(newtx, msg);
        break;

      case "reddit post":
        tx = msg.data.tx;
        newtx = new saito_lib.transaction(tx);
        this.addPost(newtx, msg);
        break;

      case "reddit comment":
        tx = msg.data.tx;
        newtx = new saito_lib.transaction(tx);
        this.addComment(newtx, msg);
        break;

      case "reddit payload":
        // msg.data.forEach(post => {
        //   this.addPost(
        //     new saito_lib.transaction(post.tx),
        //     post
        //   );
        // })
        // console.log(msg.data)
        this.dredditStore.addPosts(msg.data)
        this.dredditStore.prefetchPostThumbnails()
        break;

      case "reddit comments":
        // newtx = new saito_lib.transaction(msg.data.tx);
        // this.addComments(newtx, msg)
        console.log("COMMENT DATA", msg)
        this.dredditStore.addComments(msg.data)
        break;

      case "reddit load null":
        return

      default:
        console.log(message.request)
        return
      }
  }

  addPosts(tx, message) {
    this.dredditStore.addPosts(tx, message)
  }

  addPost(tx, message) {
    this.dredditStore.addPost(tx, message)
  }

  addComment(tx, message) {
    this.dredditStore.addComment(tx, message)
  }

}
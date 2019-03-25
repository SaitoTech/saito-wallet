import {AsyncStorage} from 'react-native'
import { observable, computed, action } from 'mobx'

export default class EmailStore {

  @observable posts = []
  @observable comments = {}

  @observable post_sig = ""

  constructor(saito) {
    this.saito = saito
  }

  @action
  addPost(tx, message) {
    if (this.posts.some(post => post.id === message.id)){
      return
    }

    let author = this.findUsersFromKeys(tx.transaction.from[0].add)

    let post = {
      id: message.id,
      title: tx.transaction.msg.title,
      author,
      votes: message.votes,
      unixtime: tx.transaction.msg.unixtime,
      subreddit: message.subreddit,
      comments: message.comments,
      text: tx.transaction.msg.text,
      link: tx.transaction.msg.link,
      sig: tx.transaction.sig,
      tx
    }

    this.posts = [...this.posts, post]
    console.log("Added Post successfully!")
  }

  addPosts(posts) {
    // console.log(posts)
    // posts = posts.map(post => {
    //   if (!post.author) {
    //     post.author = this.findUsersFromKeys(tx.transaction.from[0].add)
    //   }
    //   return post
    // })

    // this.posts = posts
    // console.log("THIS>POSTS", this.posts)
  }

  @action
  addComment(tx, message) {
    // console.log("COMMENT RECEIVED!")
    // console.log("TX", tx)
    console.log("MESSAGE", message)
    if (this.comments.some(comment => comment.id === message.data.id)){
      return
    }

    // let author = this.findUsersFromKeys(tx.transaction.from[0].add)

    let comment = {
      id: message.data.id,
      text: tx.transaction.msg.text,
      author: tx.transaction.msg.identifier,
      votes: msg.data.votes,
      unixtime: msg.data.unixtime,
      post_id: tx.transaction.msg.post_id,
      parent_id: tx.transaction.msg.parent_id,
      subreddit: tx.transaction.msg.subreddit,
      sig: tx.transaction.sig
    }

    // order comments in a correct structure

    //this.comments = [...this.comments, comment]
    this.comments = this.orderComments(comment)
  }

  @action
  addComments(comments) {
    this.comments[this.post_sig] = comments
    console.log(this.comments)
  }

  @action
  setPostSig(post_sig) {
    this.post_sig = post_sig
  }

  @computed get getPostsBySubreddit() {
    return this.posts
  }

  @computed get getCommentsByPostID() {
    return this.comments[this.post_sig]
  }


  getPostComments(post_sig) {
    message               = {};
    message.request           = "reddit load comments";
    message.data              = {};
    message.data.request      = "reddit load comments";
    message.data.subreddit    = "";
    message.data.post_id      = post_sig;
    message.data.comment_id   = 1;
    message.data.load_content = false;
    this.saito.network.sendRequest(message.request, message.data);
  }

  prefetchPostThumbnails() {
    let preFetchTasks = []; 

    this.posts.forEach((p)=>{
      preFetchTasks.push(Image.prefetch(`https://apps/saito.network/r/screenshots/${p.id}`));
    });

    Promise.all(preFetchTasks).then((results)=>{
        // let downloadedAll = true;
        // results.forEach((result)=>{
        //     if(!result){
        //         //error occurred downloading a pic
        //         downloadedAll = false;
        //     }
        // })

        // if(downloadedAll){
        //     Actions.someScene({ downloadedPics: urlOfImages})
        // }
        console.log(results)
    })
  }

  returnPostByID(post_id) {
    let post = this.posts.find(post => post.id === post_id)
    return JSON.parse(JSON.stringify(post))
  }

  findUsersFromKeys(publickey) {
    let local_id = this.saito.keys.findByPublicKey(publickey)
    local_id = local_id ? local_id : { identifiers: [] }
    return local_id.identifiers.length > 0 ? local_id.identifiers[0] : publickey;
  }

}
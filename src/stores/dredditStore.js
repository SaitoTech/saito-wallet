import {AsyncStorage} from 'react-native'
import { observable, computed, action, trace } from 'mobx'
// import config from '../../../satio.config'

export default class DredditStore {

  @observable posts = []
  @observable comments = {}

  @observable post_sig = ""
  @observable loadingPosts = false
  @observable loadingComments = false

  constructor(config, saito) {
    this.saito = saito
    this.config = config
  }

  @action
  addPosts(message) {
    let posts = message.map(post =>  {
      post.post_author = post.tx.from[0].add
      post.author = this.findUsersFromKeys(post.tx.from[0].add)
      return post
    })
    this.posts = posts
    this.setLoadingPosts(false);
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
      post_author: tx.transaction.from[0].add,
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

  @action
  addPostLocal(tx, message) {
    let author = this.findUsersFromKeys(tx.transaction.from[0].add)

    let post = {
      id: message.id,
      title: message.title,
      author,
      post_author: tx.transaction.from[0].add,
      votes: 1,
      unixtime: tx.transaction.msg.unixtime,
      subreddit: message.subreddit,
      comments: 0,
      text: message.text,
      link: message.link,
      sig: tx.transaction.sig,
      tx
    }

    this.posts = [post, ...this.posts]
  }

  @action
  editPostLocal(tx, message) {
    let new_posts = this.posts.map(post => {
      if (post.tx.sig === message.post_id) { post.text = message.data }
      return post
    });

    this.posts = new_posts.slice()
  }

  @action
  addComments(comments) {
    this.comments[this.post_sig] = comments
    this.setLoadingComments(false)
  }

  @action
  addComment(tx, msg, map) {
    // let {identifier, post_id, parent_id, subreddit, text} = tx.transaction;
    let {text, identifier, post_id, parent_id, subreddit} = msg;
    // var msg = {
    //   module: "Reddit",
    //   type: "comment",
    //   text: this.state.message,
    //   post_id: this.post.sig,
    //   parent_id: this.state.parent_id,
    //   post_author: this.post.post_author,
    //   link: link,
    //   subreddit: this.post.subreddit.toLowerCase(),
    //   identifier: this.props.saito.wallet.returnIdentifier(),
    // }
    let data = {
      text: text,
      author: identifier,
      publickey: tx.transaction.from[0].add,
      votes: 1,
      unixtime: tx.transaction.ts,
      post_id: post_id,
      parent_id: parent_id,
      subreddit: subreddit,
      sig: tx.transaction.sig,
      tx
    }
    let comment = {
      data,
      children: []
    }

    this.searchForCommentAndAdd(this.comments[this.post_sig], map, comment)

  }

  @action
  editComment(tx, msg, map) {
    this.searchForCommentAndEdit(this.comments[this.post_sig], map, msg.data)
  }

  @action
  setPostSig(post_sig) {
    this.post_sig = post_sig
  }

  @action
  updatePostVote(vote, index) {
    this.posts[index].votes = this.posts[index].votes + vote
  }

  @action
  updateCommentVote(vote, key, map) {
    console.log("WHY ARE YOU FIRING?");
    this.searchForCommentAndVote(this.comments[this.post_sig], map, vote)
  }

  @action
  setLoadingPosts(state) {
    this.loadingPosts = state
  }

  @action
  setLoadingComments(state) {
    this.loadingComments = state
  }

  searchForCommentAndVote(comments, map, vote) {
    let index = map.shift()
    if (map.length === 0) {
      comments[index].data.votes = comments[index].data.votes + vote
    } else {
      this.searchForCommentAndVote(comments[index].children, map, vote)
    }
  }

  searchForCommentAndAdd(comments, map, comment) {
    let index = map.shift()
    if (comment.data.parent_id == '0') {
      comments.push(comment)
    }
    else if (map.length === 0) {
      comments[index].children.push(comment)
    } else {
      this.searchForCommentAndAdd(comments[index].children, map, comment)
    }
  }

  searchForCommentAndEdit(comments, map, text) {
    let index = map.shift()
    if (map.length === 0) {
      comments[index].data.text = text
    } else {
      this.searchForCommentAndEdit(comments[index].children, map, text)
    }
  }

  @computed get getPostsBySubreddit() {
    return this.posts.slice()
  }

  @computed get getCommentsByPostID() {
    return this.comments[this.post_sig]
  }

  vote(vote, type, sig) {
    let request = "reddit vote"
    let message = {
      request,
      data: {}
    }
    message.data = {
      request,
      vote,
      type,
      id: sig,
    }

    this.saito.network.sendRequest(message.request, message.data)
  }


  getPostComments(post_sig) {
    console.log("POST_SIG", post_sig);
    this.setLoadingComments(true)
    let request = "reddit load comments"
    let message = {
      request,
      data: {}
    };
    message.data = {
      request,
      subreddit:  "",
      post_id: post_sig,
      comment_id: 1,
      load_content: false,
    }

    this.saito.network.sendRequest(message.request, message.data);
  }

  prefetchPostThumbnails() {
    let preFetchTasks = [];
    let {protocol, host, port} = this.config.peers[0]

    // console.log("FETCHING")
    this.posts.forEach((p) => {
      console.log(p.id)
      preFetchTasks.push(Image.prefetch(`${protocol}://${host}:${port}/r/screenshots/${p.id}`));
    });

    console.log("PREFETCHED", preFetchTasks)

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
        console.log("PREFETCHED RESULTS")
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

  reset() {
    this.posts = []
    this.comments = {}
    this.post_sig = ""
  }

}
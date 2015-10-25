var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    Article = mongoose.model('Article'),
    multer = require('multer'),
    upload = multer();

router.route('/')
  .get(function(req, res) {
    Article.find(function(err, articles) {
      if(err)
        return res.send(500, err);
      return res.send(articles);
    });
  });

router.route('/:title')
  .get(function(req, res) {
    var requestTitle = req.params.title.replace(/ /g, "_");
    requestTitle = requestTitle.charAt(0).toUpperCase() + requestTitle.slice(1);
    Article.findOne({title: requestTitle}, function(err, article) {
      if(err)
        return res.send(500, err);
      else if(article == null) {
        return res.json(new Article({ title: requestTitle, body: "Article Not Found"}));
      }
      var sendArticle = new Article();
      sendArticle.title = article.title.replace(/_/g, " ");
      sendArticle.body = article.body;
      return res.json(sendArticle);
    });
  })

  .post(upload.single(),function(req, res) {
    var articleTitle, articleBody;
    if(req.body.data!=undefined) {
      var data = JSON.parse(req.body.data);
      articleTitle = data.title;
      articleBody = data.body;
    } else {
      articleTitle = req.body.title;
      articleBody = req.body.body;
    }
    articleTitle = articleTitle.replace(/ /g, "_");
    articleTitle = articleTitle.charAt(0).toUpperCase() + articleTitle.slice(1);
    var requestTitle = req.params.title.replace(/ /g, "_");
    requestTitle = requestTitle.charAt(0).toUpperCase() + requestTitle.slice(1);
    var article = new Article({
      title: articleTitle,
      body: articleBody
    });
    Article.update({title: requestTitle}, article, {upsert: true}, function(err, stat) {
      if(err)
        return res.send(500, err);
      if(stat.nModified==1)
        return res.json({"status":"UPDATED"});
      return res.json({"status":"CREATED"});
    });
  })
module.exports = router;

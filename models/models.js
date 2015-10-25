var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    articleSchema = new mongoose.Schema({
	     title: String,
	      body: String
    }, {_id: false}, {shardkey: { title: 1, body: 0 }});

mongoose.model('Article', articleSchema);

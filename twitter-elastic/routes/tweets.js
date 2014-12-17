var twitter = require('ntwitter');
var twit = new twitter({
  consumer_key: 'E7hS667fH8p7A2iOMnANToszd',
  consumer_secret:'0OZHwdXl0IDUJrif8QuxnRufXvMDdaUm8WpqOzqW40bRSFboT1',
  access_token_key: '2845381172-Tx30UQMgoZPl2lyGYA8h9MsL8h6JUWoRiD7JZBC',
  access_token_secret: 'vhHy9MHNSHSjiFeOKKFHPtuTwpQVkrTjzldH0UC0O6pbR',
});

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
	host: 'localhost:9200',
});

tweets=[];
exports.stream = function(req, res){
	twit.stream('statuses/sample', function(stream){
		stream.on('data', function(data){
			// console.log(data);
			tweets.push(data);
			saveToElasticSearch(data);
		});
	setTimeout(function(){
		res.render('stream', {title: 'Twitter Stream', tweets: tweets});
		stream.destroy();
		console.log("Done");
		console.log(tweets[0]);
	}, 3000)

	});

	function saveToElasticSearch(tweet){

		client.index({
			index: 'tweets',
			type: 'tweet',
			body: {
				username: tweet.user.screen_name,
				profileImg: tweet.user.profile_image_url,
      			status: tweet.text,
     			date: tweet.created_at,
      			retweets: tweet.retweet_count,
      			lang: tweet.lang
			}
		}, function(err, resp) {
			console.log(err);
			console.log(resp);
		});
	}
}

exports.search = function(req, res){

	if(req.query.name){
		var name = req.query.name;
		client.search({
			index: 'tweets',
			body: {
				query: {
					match: {
						username: name
					}
				}
			}

		}, function(err, resp) {
				console.log(err);
				console.log(resp.hits.hits);
				res.render('search', {title: 'Search Results', result: resp.hits.hits})
		});
	}


}
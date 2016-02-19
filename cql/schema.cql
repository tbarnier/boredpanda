create keyspace IF NOT EXISTS boredpanda with replication = {'class':'SimpleStrategy', 'replication_factor':1};

USE boredpanda;

CREATE TABLE data (
  	id text PRIMARY KEY,
	is_article boolean,
	metrics map<text, int>,
	comments map<text, boolean>,
	title map<text, float>,
	content map<text, float>,
	media map<text, float>,
	tags map<text, float>,
	description map<text, float>,
	date map<text, text>,
	category map<text, boolean>,
	h map<text, int>,
	more map<text, boolean>,
	author_metrics map<text, int>,
	author_links map<text, boolean>,
	author_info map<text, float>
);
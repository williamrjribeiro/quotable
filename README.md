mongoimport --db quotable-dev --collection authors --type json --file client/seed-data-authors.json --jsonArray --drop

mongoimport --db quotable-dev --collection quotes --type json --file client/seed-data-quotes.json --jsonArray --drop

mongoimport --db quotable-dev --collection users --type json --file client/seed-data-users.json --jsonArray --drop

mongoimport --db quotable-dev --collection contributions --type json --file client/seed-data-contributions.json --jsonArray --drop

Adding Authors Points
name*: 20
type*: 20
nationality*: 20
born: 30
death: 30
TOTAL: 120 points

Adding Sources:
title*: 40
type*: 40
publish_date: 30
original_lang: 30
TOTAL: 140 points

Adding Quotes:
text*: 10
source_id: 200
author_id: 100
locations: 400
likes: 0
tags: 0
TOTAL: 710 points

Handling Contributions:

First
----
Just `npm install` And go grab a coffee.

Stack
----
*MEAN* project coded with *JavaScript ES6*, tested with *Jasmine* and built with *Gulp*.

Setup MongoDB
--------------
`mongod --dbpath=db`

`mongoimport --db quotable-dev --collection authors --type json --file client/seed-data-authors.json --jsonArray --drop`

`mongoimport --db quotable-dev --collection quotes --type json --file client/seed-data-quotes.json --jsonArray --drop`

`mongoimport --db quotable-dev --collection users --type json --file client/seed-data-users.json --jsonArray --drop`

`mongoimport --db quotable-dev --collection contributions --type json --file client/seed-data-contributions.json --jsonArray --drop`

`mongoimport --db quotable-dev --collection likes --type json --file client/seed-data-likes.json --jsonArray --drop`

Contributions Points
--------------
In order to promote user contributions, there's a basic gamified system in place. Every kind of contribution has some point values. Points can give you some cool rewards and permissions and be at the top of the Leader Board. (* All TBD*)
#### Adding Authors
property|value|
--- | --- |
name|20
type|20
nationality|20
born|30
death|30
**TOTAL: 120 points**

#### Adding Sources
property|value|
--- | --- |
title|40
type|40
publish_date|30
original_lang|30
**TOTAL: 140 points**

### Adding Quotes
property|value|
--- | --- |
text|10
source_id|200
author_id|100
locations|400
likes|0
tags|0
**TOTAL: 710 points**

#### Handling Contributions

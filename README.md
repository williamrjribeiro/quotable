mongoimport --db quotable-dev --collection authors --type json --file client/seed-data-authors.json --jsonArray --drop

mongoimport --db quotable-dev --collection quotes --type json --file client/seed-data-quotes.json --jsonArray --drop

First
----
Just `npm install` on your terminal and go grab a coffee.

Stack
----
*MEAN* stack project coded with *JavaScript ES6*, tested with *Jasmine* and built with *Gulp*. This is yet another learning project so don't therefore there's way too much hand-coded parts. I really like the concept of the app so slowly I'll build it into a full featured service.

Spotted a bug? Wanna help? All contributions are more than welcome!

Setup MongoDB
--------------
`mongod --dbpath=db`

Import the seed data:

`mongoimport --db quotable-dev --collection authors --type json --file client/seed-data-authors.json --jsonArray --drop`

`mongoimport --db quotable-dev --collection quotes --type json --file client/seed-data-quotes.json --jsonArray --drop`

`mongoimport --db quotable-dev --collection users --type json --file client/seed-data-users.json --jsonArray --drop`

`mongoimport --db quotable-dev --collection contributions --type json --file client/seed-data-contributions.json --jsonArray --drop`

`mongoimport --db quotable-dev --collection likes --type json --file client/seed-data-likes.json --jsonArray --drop`

Finally
----
Now just `gulp` and enjoy that hot coffee. Try the app on your browser: [localhost:3000](http://localhost:3000)

You can try any of the 3 sample users - password:
* john_doe - john
* jane_doe - jane
* mr_nobody - mrnobody

Or create your own.

Contributions Points
--------------
In order to promote user contributions, there's a basic gamefication system in place. Every kind of contribution has some point values. Points can give you some cool rewards and permissions and be at the top of the Leader Board. (* All TBD*)
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
*TBD*

## Disclaimer
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

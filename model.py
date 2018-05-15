from flask_sqlalchemy import SQLAlchemy
from correlation import pearson

db = SQLAlchemy()

##############################################################################
# Create ORM

class User(db.Model):
	"""User model."""

	__tablename__ = "users"

	user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
	# fname = db.Column(db.String(25), nullable=False)
	# lname = db.Column(db.String(25), nullable=False)
	username = db.Column(db.String(25), unique=True)
	password = db.Column(db.String(25), unique=True)
	# email = db.Column(db.String(50), nullable=False)
	score_avg = db.Column(db.Float)

	def __repr__(self):
		return "<User user_id={id} username={username}>".format(id=self.user_id,
																username=self.username)

	def find_other_users(self):
		"""Find users to compare."""

		# list of restaurants self has rated
		self_restaurants = [r.restaurants for r in self.ratings]

		other_users = []

		for r in self_restaurants:
			other_users += [u.users for u in r.ratings if u.users.username != self.username]

		other_users = list(set(other_users))

		return other_users

	def calc_user_similarity(self):
		"""Find five most similar users to self."""

		other_users = self.find_other_users()
		self_ratings_dict = {r.restaurant_id:r for r in self.ratings}

		# calculate similarity for each user in sorted_users
		# for each user, for each rating, find the corresponding rating of self
		# put them in a tuple and append to pairs
		similarities = []

		for other_user in other_users:
			pairs = []

			for other_rating in other_user.ratings:
				self_rating = self_ratings_dict.get(other_rating.restaurant_id)

				if self_rating:
					pairs.append((self_rating.user_rating, other_rating.user_rating))

			if len(pairs) >= 5:
				similarities.append((pearson(pairs), other_user))

		similarities.sort(reverse=True)

		# get 50th percentile of similar users
		sim_users = similarities[:(len(similarities) / 2)]

		return sim_users


	def user_based_recs(self):
		"""Return list of restaurants other similar users have rated 4 or above."""

		sim_users = self.calc_user_similarity()
		self_ratings_dict = {r.restaurant_id:r for r in self.ratings}

		recommendations = []

		for s in sim_users:
			user = s[1]

			for r in user.ratings:
				if not self_ratings_dict.get(r.restaurant_id) and r.user_rating >= 4:
					recommendations.append(r)

		return recommendations


class Restaurant(db.Model):
	"""Restaurant model."""

	__tablename__ = "restaurants"

	restaurant_id = db.Column(db.String(50), primary_key=True)
	name = db.Column(db.String(125), nullable=False)
	url = db.Column(db.String(300))
	address1 = db.Column(db.String(50))
	address2 = db.Column(db.String(50))
	address3 = db.Column(db.String(50))
	city = db.Column(db.String(25), nullable=False)
	state = db.Column(db.String(25), nullable=False)
	zipcode = db.Column(db.String(10), nullable=False)
	latitude = db.Column(db.Float)
	longitude = db.Column(db.Float)
	hours = db.Column(db.String(500))
	price = db.Column(db.Integer,
					  db.ForeignKey('prices.price'))
	yelp_rating = db.Column(db.Float)

	def __repr__(self):
		name = self.name
		name_for_output = name.encode('utf8', 'replace')
		return "<Restaurant restaurant_id={id} name={name}>".format(id=self.restaurant_id,
															  		name=name_for_output)

	def get_attributes(self):
		"""Return dictionary of self's attributes."""

		attributes = {}

		categories = [r.category for r in self.rest_cats]
		attributes['categories'] = categories
		attributes['price'] = self.price
		attributes['yelp_rating'] = self.yelp_rating
		# total is the total number of points a perfect match restaurant can have (total number of categories plus one for price and yelp_rating each)
		attributes['total'] = len(categories) + 2

		return attributes

	def find_sim_restaurants(self, city=None, price=None):
		"""Compares restaurant to all other restaurants in database and counts match score (based on attribute)."""

		matches = []
		anchor_attributes = self.get_attributes()
		other_restaurants = Restaurant.query.filter(Restaurant.restaurant_id != self.restaurant_id)

		for r in other_restaurants:
			other_attributes = r.get_attributes()
			match_score = 0.0

			for c in anchor_attributes['categories']:
				if c in other_attributes['categories']:
					match_score += 1

			# if anchor_attributes['price'] == other_attributes['price']:
			# 	match_score += 1

			# if anchor_attributes['yelp_rating'] == other_attributes['yelp_rating']:
			# 	match_score += 1

			# divide category match score by total possible points (number of anchor's categories + number of other's categories)
			match_score /= len(set(anchor_attributes['categories'] + other_attributes['categories']))

			matches.append((match_score, r))

		matches.sort(reverse=True)

		# save only restaurants with 4 or 5 stars
		top_matches = []

		for m in matches:
			if m[1].yelp_rating > 3:
				top_matches.append(m)

		top_matches = top_matches[:10]

		return top_matches

class Rating(db.Model):
	"""Rating model."""

	__tablename__ = "ratings"

	rating_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
	restaurant_id = db.Column(db.String(50), 
							  db.ForeignKey('restaurants.restaurant_id'), nullable=False)
	user_id = db.Column(db.Integer,
						db.ForeignKey('users.user_id'), nullable=False)
	user_rating = db.Column(db.Float, nullable=False)


	restaurants = db.relationship('Restaurant', backref=db.backref('ratings',
																	order_by=rating_id))
	users = db.relationship('User', backref=db.backref('ratings',
														order_by=rating_id))

	def __repr__(self):
		return "<Rating rating_id={id} user_rating={rating}>".format(id=self.rating_id,
																	 rating=self.user_rating)


class Category(db.Model):
	"""Category model."""

	__tablename__ = "categories"

	category = db.Column(db.String(50), primary_key=True)

	def __repr__(self):
		return "<Category category={category}>".format(category=self.category)


class Rest_cat(db.Model):
	"""Rest_cat model."""

	__tablename__ = "rest_cats"

	rest_cat_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
	restaurant_id = db.Column(db.String(50),
							  db.ForeignKey('restaurants.restaurant_id'), nullable=False)
	category = db.Column(db.String(50),
					  	 db.ForeignKey('categories.category'), nullable=False)


	restaurants = db.relationship('Restaurant', backref=db.backref('rest_cats',
																   order_by=rest_cat_id))
	categories = db.relationship('Category', backref=db.backref('rest_cats',
																order_by=rest_cat_id))

	def __repr__(self):
		return "<Rest_cat restaurant_id={rest_id} category={category}>".format(rest_id=self.restaurant_id,
																     		   category=self.category)


class Price(db.Model):
	"""Price model."""

	__tablename__ = "prices"

	price = db.Column(db.Integer, primary_key=True)

	restaurants = db.relationship('Restaurant', backref=db.backref('prices',
																   order_by=price))

	def __repr__(self):
		return "<Price price={price}>".format(price=self.price)


##############################################################################
# Helper functions

def init_app():
	from flask import Flask
	app = Flask(__name__)

	connect_to_db(app)
	print "Connected to DB"


def connect_to_db(app):
	"""Connect the database to my Flask app"""

	app.config['SQLALCHEMY_DATABASE_URI'] = 'postgres:///projectdb'
	app.config['SQLALCHEMY_ECHO'] = False
	app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
	db.app = app
	db.init_app(app)


if __name__ == "__main__":

	init_app()
	db.create_all()


from flask import Flask, session, render_template, request, flash, redirect, Markup
from flask_debugtoolbar import DebugToolbarExtension
from sqlalchemy import func
from model import *

import urllib
import urllib2

# -- coding: utf-8 --

app = Flask(__name__)
app.secret_key = "athena"

@app.route("/")
def welcome_user():

	return render_template("index.html")

@app.route("/login")
def display_login():

	return render_template("login.html")

@app.route("/handle-login", methods=['POST'])
def handle_login():
	"""Validate user info and save username in session."""
	
	# get username from form submission
	username = request.form['username']
	pw = request.form['password']

	# check if username and pw exist in db
	if User.query.filter_by(username=username, password=pw).all():
		session['username'] = username
		return redirect("/profile")
	else:
		flash(Markup('Email and/or password is invalid. Please try again or <a href="/signup">create an account</a>.'))
		return redirect("/login")

@app.route("/handle-logout")
def handle_logout():

	session.clear()

	return redirect("/")

@app.route("/signup")
def display_signup():

	return render_template("signup.html")

@app.route("/handle-signup", methods=['POST'])
def create_user_account():

	# get username from form submission
	username = request.form['username']
	pw = request.form['password']

	# redirect to login page if user already has account
	if User.query.filter_by(username=username, password=pw).all():
		flash(Markup('Account already exists. Please log in.'))
		return redirect("/login")
	# if user does not yet exist, add to db and redirect to login
	else:
		new_user = User(username=username,
						password=pw,
						score_avg=None)
		db.session.add(new_user)
		db.session.commit()
		flash("Account created! Please log in.")
		return redirect("/login")

@app.route("/profile")
def show_profile():

	if 'username' not in session:
		flash("Uh oh, you don't have a profile. Create one now!")
		return redirect("/signup")

	else:
		cities = Restaurant.query.with_entities(Restaurant.city, 
												func.count(Restaurant.city)).group_by(Restaurant.city).all()

		cities.sort()

		return render_template("profile.html", cities=cities, session=session)

@app.route("/search")
def show_search():

	cities = Restaurant.query.with_entities(Restaurant.city, 
												func.count(Restaurant.city)).group_by(Restaurant.city).all()

	cities.sort()

	return render_template("search-form.html", cities=cities)

@app.route("/handle-search")
def search_restaurants():

	# find = request.args.get('find')
	location = request.args['location']
	
	print request.args

	restaurants = Restaurant.query.filter_by(city=location).order_by(Restaurant.name)

	return render_template('search-results.html', location=location, restaurants=restaurants)

@app.route("/details/<restaurant_id>")
def show_details(restaurant_id):

	r = Restaurant.query.filter_by(restaurant_id=restaurant_id).one()

	if 'username' in session:
		user = User.query.filter_by(username=session['username']).one()
		rating = Rating.query.filter(Rating.user_id==user.user_id, Rating.restaurant_id==restaurant_id).all()
		
		if rating:
			rating = float(rating[0].user_rating)
	else:
		user = None
		rating = None

	return render_template("details.html", restaurant=r, session=session, user=user, rating=rating)

@app.route("/rate-restaurant", methods=['POST'])
def record_rating():

	rating = request.form.get('rating')
	restaurant_id = request.form.get('restaurant_id')
	user = User.query.filter_by(username=session['username']).one()

	existing_rating = Rating.query.filter(Rating.user_id==user.user_id, Rating.restaurant_id==restaurant_id).all()
	if existing_rating:
		existing_rating[0].user_rating = rating
		db.session.commit()
	else:
		new_rating = Rating(restaurant_id=restaurant_id,
							user_id=user.user_id,
							user_rating=rating)

		db.session.add(new_rating)
		db.session.commit()

	return redirect("/details/" + restaurant_id)


if __name__ == "__main__":
	# app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False

	connect_to_db(app)

	# Use the DebugToolbar
	DebugToolbarExtension(app)

	app.run(debug=True, host="0.0.0.0")
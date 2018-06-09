class RatingParent extends React.Component {
	constructor(props) {
		super(props);
		this.handleRatingChange = this.handleRatingChange.bind(this);
		this.state = {currentRating: 0};
	}

	componentDidMount() {

		fetch('/user-rating.json',
			  {credentials: 'include'}).then((response) => response.json())
									   .then((data) => (data) ? this.setState({currentRating: data['userRating']}) 
									   						  : this.setState({currentRating: 0}));
	}

	handleRatingChange(newRating) {
		this.setState({currentRating: newRating['rating']});
	}

	render () {

		const currentRating = this.state.currentRating;

		return (
			<div>
				<RestaurantDetails 
					currentRating={currentRating}
					onRatingChange={this.handleRatingChange} />
			</div>
		);
	}
}

class RestaurantDetails extends React.Component {
	constructor(props) {
		super(props);
		this.fillStar = this.fillStar.bind(this);
		this.unfillStar = this.unfillStar.bind(this);
		this.toggleStar = this.toggleStar.bind(this);
		this.untoggleStar = this.untoggleStar.bind(this);
		this.recordRating = this.recordRating.bind(this);
		this.changeRating = this.changeRating.bind(this);
		this.createUserStars = this.createUserStars.bind(this);
		this.createYelpStars = this.createYelpStars.bind(this);
		this.state = {details: {},
					  categories: [],
					  rating: 0};
	}

	componentDidMount() {

		fetch('/details.json',
			  {credentials: 'include'}).then((response) => response.json())
									   .then((data) => this.setState({details: data, categories: data['categories']}));
	}

	fillStar(evt) {
		for (let range = 0; range < (evt.target.id[4] - this.props.currentRating); range++ ) {
			let number = evt.target.id[4] - range;
			let idString = "star" + number;
			document.getElementById(idString).className = "fas fa-star";
		}
	}

	unfillStar(evt) {
		for (let range = 0; range < (evt.target.id[4] - this.props.currentRating); range++ ) {
			let number = evt.target.id[4] - range;
			let idString = "star" + number;
			document.getElementById(idString).className = "far fa-star";
		}
	}

	toggleStar(evt) {
		let num = evt.target.id[4];
		for (let range = this.props.currentRating; range > num; range-- ) {
			let number = range;
			let idString = "star" + number;
			document.getElementById(idString).className = "far fa-star";
		}
	}

	untoggleStar(evt) {
		let num = evt.target.id[4];
		for (let range = num; range < this.props.currentRating + 1; range++ ) {
			let number = range;
			let idString = "star" + number;
			document.getElementById(idString).className = "fas fa-star";
		}
	}

	recordRating() {

		fetch(`/rate-restaurant.json?rating=${this.state.rating}`,
			  {credentials: 'include'}).then((response) => response.json())
									   .then((data) => this.props.onRatingChange(data));
	}

	changeRating(evt) {

		let stars = Number(evt.target.id[4]);
		this.setState({rating: stars}, this.recordRating);
	}

	createUserStars(rtg) {
		let you = [];
		let test = [];

		for (let step = 1; step < rtg + 1; step++ ) {
			let starId = "star" + step;
			you.push(
				<i key={step}
				   id={starId}
				   className="fas fa-star"
				   onMouseOver={ this.toggleStar }
			   	   onMouseOut={ this.untoggleStar }
			   	   onClick={ this.changeRating }></i>)
		}

		for (let step = rtg + 1; step < 6; step++ ) {
			let starId = "star" + step
			you.push(
				<i key={step}
				   id={starId}
				   className="far fa-star"
				   onMouseOver={ this.fillStar }
				   onMouseOut={ this.unfillStar }
				   onClick={ this.changeRating }></i>)
		}

		console.log("you: ", you);
		console.log("test: ", test);
		return you;
	}

	createYelpStars(rtg) {
		let yelp =[];
		for (let step = 0; step < rtg; step++ ) {
			yelp.push(<i key={step} className="fas fa-star"></i>)
		}

		return yelp;
	}

	render() {
		
		const currentRating = this.props.currentRating;
		const yelp_rating = this.state.details['yelp_rating'];

		let you = this.createUserStars(currentRating);
		let yelp = this.createYelpStars(yelp_rating);

		return (
			<div className="row">
				<div className="col detailPage">
					<h3>{this.state.details['name']}</h3>
					Yelp: {yelp} | You: {you}
					<p>{'$'.repeat(this.state.details['price'])} | {this.state.categories.join(", ")}</p>
					<p>Address:</p>
					{this.state.details['address1']}<br/>
					{this.state.details['city']}, {this.state.details['state']} {this.state.details['zipcode']}
					<p><a href={this.state.details['yelp_url']} target="_blank">Go to yelp page</a></p>
				</div>
			</div>
		)
	}
}


ReactDOM.render(
	<RatingParent />,
	document.getElementById("ratingParent")
);
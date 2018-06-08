class RatingParent extends React.Component {
	constructor(props) {
		super(props);
		this.handleRatingChange = this.handleRatingChange.bind(this);
		this.state = {currentRating: "Rate below"};
	}

	componentDidMount() {

		fetch('/user-rating.json',
			  {credentials: 'include'}).then((response) => response.json())
									   .then((data) => (data) ? this.setState({currentRating: data['userRating']}) 
									   						  : this.setState({currentRating: "Rate below"}));

	}

	handleRatingChange(newRating) {
		this.setState({currentRating: newRating});
	}

	render () {

		const currentRating = this.state.currentRating;

		return (
			<div>
				<RestaurantDetails 
					currentRating={currentRating} />
				<div className="rateButtons">
					<RateButton value="1"
								className="rateBtn"
								rating={currentRating}
								onRatingChange={this.handleRatingChange} />
					<RateButton value="2"
								className="rateBtn"
								rating={currentRating}
								onRatingChange={this.handleRatingChange} />
					<RateButton value="3" 
								className="rateBtn"
								rating={currentRating}
								onRatingChange={this.handleRatingChange} />
					<RateButton value="4"
								className="rateBtn"
								rating={currentRating}
								onRatingChange={this.handleRatingChange} />
					<RateButton value="5"
								className="rateBtn"
								rating={currentRating}
								onRatingChange={this.handleRatingChange} />
				</div>
			</div>
		);
	}
}

class RestaurantDetails extends React.Component {
	constructor(props) {
		super(props);
		this.state = {details: {},
					  categories: [],
					  userRating: "Rate below"};
	}

	componentDidMount() {

		fetch('/details.json',
			  {credentials: 'include'}).then((response) => response.json())
									   .then((data) => this.setState({details: data, categories: data['categories']}));
	}

	render() {


		const currentRating = this.props.currentRating;
		const yelp_rating = this.state.details['yelp_rating'];

		let you = [];
		for (let step = 0; step < currentRating; step++ ) {
			you.push(<i key={step} className="fas fa-star"></i>)
			}

		let yelp =[];
		for (let step = 0; step < yelp_rating; step++ ) {
			yelp.push(<i key={step} className="fas fa-star"></i>)
			}

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

class RateButton extends React.Component {
	constructor(props) {
		super(props);
		this.rate = this.rate.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.state = {rating: 0};
	}

	handleChange(data) {
		let newRating = data['rating'];
		this.props.onRatingChange(newRating);
	}

	changeRating() {

		///////////////////////////// POST request //////////////////////////////
		// let data = new FormData();										   //
		// data.append("json", JSON.stringify({'rating': this.state.rating})); //
		//         														       //
		// fetch('/rate-restaurant.json',									   //
		// 	  {credentials: 'include',										   //
		// 	   method: 'post',												   //
		// 	   body: data}).then((response) => response.json())				   //
		// 				   .then((data) => console.log(data));				   //
		/////////////////////////////////////////////////////////////////////////

		// GET request
		fetch(`/rate-restaurant.json?rating=${this.state.rating}`,
			  {credentials: 'include'}).then((response) => response.json())
									   .then((data) => this.handleChange(data));


	}

	rate() {
		this.setState({rating: Number(this.props.value)}, this.changeRating);
	}
	
	render() {
		
		return (
			<div>
				<button className="btn btn-outline-info rate" onClick={ this.rate }>{this.props.value}
				</button>
			</div>
			);
	}
}

ReactDOM.render(
	<RatingParent />,
	document.getElementById("ratingParent")
);
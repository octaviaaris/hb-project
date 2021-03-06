class TopPicks extends React.Component {
	constructor(props) {
		super(props);
		this.state = {topPicks: {}};
	}

	componentDidMount() {

		// $.get("/top-picks.json", 

		// 	function(result) {
		// 		this.setState({topPicks: result});
		// 		}.bind(this)
		// 	)

		// request top restaurant picks and set state
		fetch(`/top-picks.json`,
			  {credentials: 'include'}).then((response) => response.json())
									   .then((data) => this.setState({topPicks: data}));
	}

	render() {
		let url = "/details/"
		let resultArray = [];
		let resultKey = 0;
		let recommendations = this.state.topPicks;

		// get price and rating info for each top pick
		for (let pick in recommendations) {

			let price = [];
			for (let step = 0; step < recommendations[pick].price; step++ ) {
				
				// generate dollar sign icons based on price 
				price.push(<i className="fas fa-dollar-sign"></i>)
			}

			let rating = [];
			for (let step = 0; step < recommendations[pick].yelp_rating; step++ ) {
				
				// generate star icons based on price
				if (recommendations[pick].yelp_rating - step == 0.5) {
					rating.push(<i className="fas fa-star-half"></i>)
				} else {
					rating.push(<i className="fas fa-star"></i>)
				}
			}

			if (resultKey == 0) {
				
				// add "active" class to first top pick for bootstrap carousel
				resultArray.push(
					<div className="carousel-item active" key={resultKey}>
				      <a href={url + pick} key={resultKey} className="restaurantName">{recommendations[pick].name}</a><br/>
				      {rating}<br/>
				      {price} | {recommendations[pick].categories.join(", ")}<br/>
				      <p className="address">{recommendations[pick].address1}<br/>
				      {recommendations[pick].city}, {recommendations[pick].state} {recommendations[pick].zipcode}</p>
				    </div>
				 );
			} else {
				resultArray.push(
					<div className="carousel-item" key={resultKey}>
				      <a href={url + pick} key={resultKey} className="restaurantName">{recommendations[pick].name}</a><br/>
				      {rating}<br/>
				      <p className="text-truncate">{price} | {recommendations[pick].categories.join(", ")}</p>
				      <p className="address">{recommendations[pick].address1}<br/>
				      {recommendations[pick].city}, {recommendations[pick].state} {recommendations[pick].zipcode}</p>
				    </div>
					);
			}
			resultKey++;

		}
		return (
			<div>
			<div id="top-picks" key={1}>
			  <div id="topPicksHeader"><h2>Top Picks For You</h2></div>
			</div>
		  	<div id="carouselExampleIndicators" className="carousel slide" data-ride="carousel" data-interval="false" key={2}>
  		      <ol className="carousel-indicators text-primary">
			    <li data-target="#carouselExampleIndicators" data-slide-to="0" className="active"></li>
			    <li data-target="#carouselExampleIndicators" data-slide-to="1"></li>
			    <li data-target="#carouselExampleIndicators" data-slide-to="2"></li>
			    <li data-target="#carouselExampleIndicators" data-slide-to="3"></li>
			    <li data-target="#carouselExampleIndicators" data-slide-to="4"></li>
			  </ol>
  		      <div className="carousel-inner" key={3}>
			  {resultArray}
			  </div>
			  <a className="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev" key={4}>
			    <i className="fas fa-chevron-circle-left"></i>
			  </a>
			  <a className="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next" key={5}>
			    <i className="fas fa-chevron-circle-right"></i>
			  </a>
		  	</div>
			</div>
			)
	}
		
}

ReactDOM.render(
	<TopPicks />,
	document.getElementById("recommendations")
);
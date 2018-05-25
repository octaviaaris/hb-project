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

		fetch(`/top-picks.json`, {credentials: 'include'}).then((response) => response.json())
								.then((data) => this.setState({topPicks: data}));

	}

	render() {

		let url = "/details/"
		let resultArray = [];
		let resultKey = 0;

		for (let pick in this.state.topPicks) {
			resultKey++;
			resultArray.push(
				<li key={resultKey}><a href={url + pick} target="_blank">{this.state.topPicks[pick][0]}</a> ({this.state.topPicks[pick][1]})</li>
				)
		}
		
		return (<ul>{resultArray}</ul>)
	}
}

ReactDOM.render(
	<TopPicks />,
	document.getElementById("recommendations")
);
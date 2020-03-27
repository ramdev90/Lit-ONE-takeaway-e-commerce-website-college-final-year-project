const payStack = (req) => {
	const mySecret = "Bearer sk_test_47dc10761b9ebd70f54e0de7dddc2620409f93d9";

	const initializePayment = (form, callBack) => {
		const options = {
			url: "https://api.paystack.co/transaction/initialize",
			headers: {
				authorization: mySecret,
				"content-type": "application/json",
				"cache-control": "no-cache"
			},
			form
		};
		const myCallback = (err, response, body) => {
			return callBack(err, body);
		};
	};

	const verifyPayment = (ref, myCallback) => {
		const options = {
			url:
				"https://api.paystack.co/transaction/verify/" +
				encodeURIComponent(ref),
			headers: {
				authorization: mySecret,
				"content-type": "application/json",
				"cache-control": "no-cache"
			}
		};
		const callback = (err, response, body) => {
			return myCallback(err, body);
		};
		req(options, callback);
	};

	return { initializePayment, verifyPayment };
};

module.exports = payStack;

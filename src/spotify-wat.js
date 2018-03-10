var rp = require('request-promise');
var tough = require('tough-cookie');

var UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36';

function getCSRF(cookiejar) {
	return rp('https://accounts.spotify.com/login', {
		resolveWithFullResponse: true,
		headers: {
			'user-agent': UA
		},
		jar: cookiejar
	}).then(function (resp) {
		return resp.headers['set-cookie']
			.find(e => e.indexOf('csrf_token') === 0)
			.split(';')[0]
			.replace('csrf_token=', '');
	})
}

function login(cookiejar, username, password, csrf_token) {
	return rp({
		url: 'https://accounts.spotify.com/api/login',
		method: 'POST',
		form: {
			remember: false,
			username: username,
			password: password,
			csrf_token: csrf_token,
		},
		jar: cookiejar,
		headers: {
			'user-agent': UA
		}
	});
}

function getAccessToken(cookiejar) {
	return rp({
		url: 'https://open.spotify.com/browse',
		jar: cookiejar,
		resolveWithFullResponse: true,
		headers: {
			'user-agent': UA
		}
	}).then(function (resp) {
		return resp.headers['set-cookie']
			.find(e => e.indexOf('wp_access_token') === 0)
			.split(';')[0]
			.replace('wp_access_token=', '')
	});
}

exports.getAccessToken = function (username, password) {
	var cookiejar = rp.jar();
	cookiejar.setCookie(new tough.Cookie({
		key: '__bon',
		value: 'MHwwfC0yMDk5NTIyNzI4fC04ODE3OTk1NDU3NnwxfDF8MXwx', // Get dynamically
		domain: 'accounts.spotify.com',
	}), 'https://accounts.spotify.com');

	return getCSRF(cookiejar)
		.then(function (csrf) {
			return login(cookiejar, username, password, csrf);
		})
		.then(function () {
			return getAccessToken(cookiejar);
		})
		.then(function (token) {
			return token;
		});
};
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// export const BACKEND_URL ="http://13.204.43.47:8000/"
const baseUrl = "http://13.204.43.47:8000"
  
   
// http://13.204.43.47:8000/api/v1/user/send-otp
export async function getHeaders() {
	let token = await AsyncStorage.getItem('user_token');
	console.log(token,"token")
	if (token) {
		// userData = JSON.parse(userData);
		//console.log(userData.accessToken, 'header')
		return {
			authorization: `bearer ${token}`,
		};
	}
	return {};
}


export async function apiReq(
	endPoint,
	data,
	method,
	headers,
	requestOptions = {}
) {

	return new Promise(async (res, rej) => {
		const getTokenHeader = await getHeaders();

		headers = {
			...getTokenHeader,
			...headers
		};

		if (method === 'get' || method === 'delete') {
			data = {
				...requestOptions,
				...data,
				headers
			};
		}
		console.log("endPointendPoint",`${baseUrl}${endPoint}`)

		axios[method](`${baseUrl}${endPoint}`, data, { headers })
			.then(result => {
				console.log("api result response",result)
				const { data } = result;

				if (data.status === false) {
					return rej(data);
				}
 
				return res(data);
			})
			.catch(error => {
				console.log(error,"error in api call")
				console.log(error && error.response, 'the error respne')
				if (error && error.response && error.response.status === 401) {
							//logout user
							alert("user not valid")
				}
				if (error && error.response && error.response.data) {
					if (!error.response.data) {
						return rej({ ...error.response.data})
					}
					return rej(error.response.data)
				} else {
					return rej({ message: "Network Error", message: "Network Error" });
				}
			});
	});
}

export function apiPost(endPoint, data, headers = {}) {
	return apiReq(endPoint, data, 'post', headers);
}

export function apiDelete(endPoint, data, headers = {}) {
	return apiReq(endPoint, data, 'delete', headers);
}

export function apiGet(endPoint, data, headers = {}, requestOptions) {
	return apiReq(endPoint, data, 'get', headers, requestOptions);
}

export function apiPut(endPoint, data, headers = {}) {
	return apiReq(endPoint, data, 'put', headers);
}

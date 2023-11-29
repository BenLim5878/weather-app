import NavBar from "../../../components/nav";
import Page from "../../../components/page";
import PageWrapper from "../../../components/pageWrapper";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import axios from 'axios';
import LineChart from "../../../components/lineChart";
import { TemperatureMetricContext } from '../../../context/temperatureMetricContext';
import { SavedFavoriteContext } from '../../../context/savedFavoriteContext';
import Cookies from 'js-cookie';

function IndexPage() {

	const router = useRouter()
	const [locationName, setLocationName] = useState("Loading...")
	const [isFavorite, setIsFavorite] = useState(false)
	const [isWarningShow, setIsWarningShow] = useState(false)
	const [weatherData, setWeatherData] = useState(undefined)
	const [forecastData, setForecastData] = useState(undefined)
	const [hourlyTemperatureData, setHourlyTemperatureData] = useState(undefined)
	const [hourlyHumidityData, setHourlyHumidityData] = useState(undefined)
	const { temperatureMetric, updateTemperatureMetric } = useContext(TemperatureMetricContext)
	const { savedFavorite, updateSavedFavorite } = useContext(SavedFavoriteContext)
	const currentDate = new Date();

	function capitalizeFirstLetter(string) {
		return string
			.split(' ')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	function getDayOfWeek(unixTimestamp) {
		const date = new Date(unixTimestamp * 1000);
		return date.toLocaleDateString('en-US', { weekday: 'long' });
	}

	function formatTime(unixTimestamp) {
		const date = new Date(unixTimestamp * 1000); // Convert to milliseconds
		let hours = date.getHours();
		const minutes = "0" + date.getMinutes();
		const ampm = hours >= 12 ? 'PM' : 'AM';
		hours = hours % 12;
		hours = hours ? hours : 12; // the hour '0' should be '12'
		const formattedTime = hours + ':' + minutes.substr(-2) + ' ' + ampm;
		return formattedTime;
	}

	function kelvinToCelsius(value) {
		return (value - 273.15).toFixed(2);
	}

	function kelvinToFahrenheit(value) {
		return ((value - 273.15) * 9 / 5 + 32).toFixed(2);
	}

	function getCurrentTimezone() {
		return Intl.DateTimeFormat().resolvedOptions().timeZone;
	}

	function getDirection(degrees) {
		if (degrees >= 0 && degrees <= 360) {
			if (degrees >= 337.5 || degrees <= 22.5) {
				return 'N';
			} else if (degrees > 22.5 && degrees < 67.5) {
				return 'NE';
			} else if (degrees >= 67.5 && degrees <= 112.5) {
				return 'E';
			} else if (degrees > 112.5 && degrees < 157.5) {
				return 'SE';
			} else if (degrees >= 157.5 && degrees <= 202.5) {
				return 'S';
			} else if (degrees > 202.5 && degrees < 247.5) {
				return 'SW';
			} else if (degrees >= 247.5 && degrees <= 292.5) {
				return 'W';
			} else if (degrees > 292.5 && degrees < 337.5) {
				return 'NW';
			}
		} else {
			return 'Invalid degree value';
		}
	}

	function getFavoriteLocations() {
		const favoriteLocations = Cookies.get('favoriteLocations');
		return favoriteLocations ? JSON.parse(favoriteLocations) : [];
	}

	function setFavoriteLocation() {
		const { lat, lng } = router.query

		// Get current favorite locations
		const currentFavorites = getFavoriteLocations();

		// Check if the location already exists
		if (currentFavorites.some(loc => loc.address_name === locationName)) {
			console.log("Location already exists in favorites.");
			return;
		}

		// Check if there are already 3 locations
		if (currentFavorites.length >= 3) {
			setIsWarningShow(true)
			setTimeout(() => {
				setIsWarningShow(false)
			}, 3000)
			return;
		}

		// Add new location
		currentFavorites.push({ locationName, lat, lng });
		updateSavedFavorite(currentFavorites)
		Cookies.set('favoriteLocations', JSON.stringify(currentFavorites), { expires: 7 });
		setIsFavorite(true)
	}

	function removeFavoriteLocation() {
		// Get current favorite locations
		let currentFavorites = getFavoriteLocations();

		// Filter out the location to remove
		currentFavorites = currentFavorites.filter(loc => loc.locationName !== locationName);

		// Update the cookie
		Cookies.set('favoriteLocations', JSON.stringify(currentFavorites), { expires: 7 });
		updateSavedFavorite(currentFavorites)
		setIsFavorite(false)
	}

	async function getLocationName(latitude, longitude) {
		const apiKey = `${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}`;
		const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
		try {
			const response = await fetch(url);
			const data = await response.json();
			if (data.status === 'OK') {
				return data.results[0].formatted_address;
			} else {
				return 'Address not found';
			}
		} catch (error) {
			console.error('Error:', error);
		}
	}

	async function getHourlyData(latitude, longitude, temperatureUnit = "celsius") {
		const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=${encodeURIComponent(getCurrentTimezone())}&temperature_unit=${temperatureUnit}`
		axios.get(url)
			.then(response => {
				const hourlyTemperature = []
				const hourlyHumidity = []
				response.data.hourly.time.forEach((time, index) => {
					if (index < 24) {
						const hour = time.split('T')[1];
						hourlyTemperature.push({
							time: hour,
							data: response.data.hourly.temperature_2m[index]
						})
						hourlyHumidity.push({
							time: hour,
							data: response.data.hourly.relative_humidity_2m[index]
						})
					}
				}
				);
				setHourlyTemperatureData(hourlyTemperature)
				setHourlyHumidityData(hourlyHumidity)
			})
			.catch(error => {
				console.error("Error fetching data: ", error);
			})
	}

	async function getForecastData(latitude, longitude) {
		const API_KEY = `${process.env.NEXT_PUBLIC_OPEN_WEATHER_MAP_API_KEY}`
		const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
		axios.get(url)
			.then(response => {
				const next5DaysAtNoon = response.data.list.filter(entry => {
					const entryDate = new Date(entry.dt * 1000);
					// Check if the time is 12 PM
					const isNoon = entryDate.getHours() === 11;
					// Check if the date is within the next 7 days
					const isWithin7Days = entryDate > currentDate && entryDate < new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
					return isNoon && isWithin7Days;
				}).map(entry => {
					return {
						...entry,
						day: getDayOfWeek(entry.dt),
					};
				});
				setForecastData(next5DaysAtNoon)
			})
			.catch(error => {
				console.error("Error fetching data: ", error);
			})
	}

	async function getWeatherData(latitude, longitude) {
		const API_KEY = `${process.env.NEXT_PUBLIC_OPEN_WEATHER_MAP_API_KEY}`
		const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
		axios.get(url)
			.then(response => {
				setWeatherData(response.data)
			})
			.catch(error => {
				console.error("Error fetching data: ", error);
			})
	}

	useEffect(async () => {
		if (router.query.lat && router.query.lng) {
			const { lat, lng } = router.query
			const locationName = await getLocationName(lat, lng)
			setLocationName(locationName)
			getWeatherData(lat, lng)
			getForecastData(lat, lng)
			getHourlyData(lat, lng)

			const locations = getFavoriteLocations()
			setIsFavorite(false)
			locations.forEach(location => {
				if (location.lat === lat && location.lng === lng) {
					setIsFavorite(true)
				}
			});
		}
	}, [router.query])

	useEffect(async () => {
		if (router.query.lat && router.query.lng) {
			const { lat, lng } = router.query
			if (temperatureMetric == "fahrenheit") {
				getHourlyData(lat, lng, "fahrenheit")
			} else {
				getHourlyData(lat, lng)
			}
		}
	}, [temperatureMetric])

	return (
		<Page className="bg-zinc-900" isBackgroundTransparent={true}>
			<NavBar />
			{
				weatherData ? (
					<div className="z-10 relative">
						<PageWrapper hasDynamicContent={true}>
							{
								isWarningShow ?
									<div className="fixed left-1/2 mt-[4.5rem] xs:mt-[8.25rem] text-center sm:w-auto w-4/5 sm:mt-4 -translate-x-1/2 px-12 py-3 bg-rose-700 rounded-lg font-inter text-neutral-200 transition-all drop-shadow-2xl">You can only save up to 3 favorite locations.</div> :
									<></>
							}
							<div className="flex sm:flex-row flex-col items-start sm:gap-3 mt-10 w-full">
								<div>
									{
										weatherData ?
											<img src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`} className="w-20"></img> :
											<img src={`https://openweathermap.org/img/wn/50d@2x.png`} className="w-20"></img>
									}
								</div>
								<div className="mt-3 flex flex-col gap-1 w-full">
									<div className="flex sm:flex-row flex-col gap-4 sm:gap-6 sm:items-center">
										<h1 className="font-inter text-3xl font-semibold text-neutral-100">{locationName}</h1>
										<div className="flex items-center gap-3 xs:flex-wrap">
											<div className="flex items-center gap-3 h-fit">
												<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 434 434" className="fill-orange-400">
													<path d="M216.667 66.6667C225.867 66.6667 233.333 59.2 233.333 50V16.6667C233.333 7.46667 225.867 0 216.667 0C207.458 0 200 7.46667 200 16.6667V50C200 59.2 207.458 66.6667 216.667 66.6667Z" />
													<path d="M50 200H16.6667C7.45833 200 0 207.467 0 216.667C0 225.867 7.45833 233.333 16.6667 233.333H50C59.2 233.333 66.6667 225.867 66.6667 216.667C66.6667 207.467 59.2 200 50 200Z" />
													<path d="M416.667 200H383.333C374.125 200 366.667 207.467 366.667 216.667C366.667 225.867 374.125 233.333 383.333 233.333H416.667C425.867 233.333 433.333 225.867 433.333 216.667C433.333 207.467 425.867 200 416.667 200Z" />
													<path d="M369.875 63.4584C363.367 56.9501 352.817 56.9501 346.308 63.4584L322.742 87.0251C316.233 93.5334 316.233 104.083 322.742 110.592C326 113.85 330.258 115.475 334.525 115.475C338.792 115.475 343.05 113.85 346.308 110.592L369.875 87.0251C376.383 80.5167 376.383 69.9667 369.875 63.4584Z" />
													<path d="M110.592 87.0251L87.025 63.4584C80.5167 56.9501 69.9667 56.9501 63.4583 63.4584C56.95 69.9667 56.95 80.5167 63.4583 87.0251L87.025 110.592C90.2833 113.85 94.5417 115.475 98.8083 115.475C103.075 115.475 107.342 113.85 110.592 110.592C117.108 104.083 117.108 93.5417 110.592 87.0251Z" />
													<path d="M216.667 100C152.333 100 100 152.333 100 216.667C100 237.075 105.433 257.258 115.733 275.025C118.708 280.167 124.2 283.333 130.15 283.333H303.183C309.133 283.333 314.625 280.167 317.608 275.025C327.9 257.258 333.333 237.075 333.333 216.667C333.333 152.333 281 100 216.667 100ZM292.975 250H140.358C135.742 239.483 133.333 228.125 133.333 216.667C133.333 170.717 170.717 133.333 216.667 133.333C262.617 133.333 300 170.717 300 216.667C300 228.125 297.592 239.483 292.975 250Z" />
													<path d="M228.45 321.55C221.942 315.042 211.392 315.042 204.883 321.55L154.883 371.55C148.375 378.058 148.375 388.608 154.883 395.117C161.392 401.625 171.942 401.625 178.45 395.117L200 373.567V416.667C200 425.867 207.458 433.333 216.667 433.333C225.867 433.333 233.333 425.867 233.333 416.667V373.567L254.883 395.117C258.142 398.375 262.4 400 266.667 400C270.933 400 275.192 398.375 278.45 395.117C284.958 388.608 284.958 378.058 278.45 371.55L228.45 321.55Z" />
												</svg>
												{
													weatherData ?
														<p className="font-inter text-neutral-300">{formatTime(weatherData.sys.sunrise)}</p> :
														<p className="font-inter text-neutral-300">0:00 AM</p>
												}
											</div>
											<div className="flex items-center gap-3 h-fit">
												<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 434 434" className="fill-blue-500">
													<path d="M216.667 66.6667C225.867 66.6667 233.333 59.2 233.333 50V16.6667C233.333 7.46667 225.867 0 216.667 0C207.458 0 200 7.46667 200 16.6667V50C200 59.2 207.458 66.6667 216.667 66.6667Z" />
													<path d="M50 200H16.6667C7.45833 200 0 207.467 0 216.667C0 225.867 7.45833 233.333 16.6667 233.333H50C59.2 233.333 66.6667 225.867 66.6667 216.667C66.6667 207.467 59.2 200 50 200Z" />
													<path d="M416.667 200H383.333C374.125 200 366.667 207.467 366.667 216.667C366.667 225.867 374.125 233.333 383.333 233.333H416.667C425.867 233.333 433.333 225.867 433.333 216.667C433.333 207.467 425.867 200 416.667 200Z" />
													<path d="M369.875 63.4584C363.367 56.9501 352.817 56.9501 346.308 63.4584L322.742 87.0251C316.233 93.5334 316.233 104.083 322.742 110.592C326 113.85 330.258 115.475 334.525 115.475C338.792 115.475 343.05 113.85 346.308 110.592L369.875 87.0251C376.383 80.5167 376.383 69.9667 369.875 63.4584Z" />
													<path d="M110.592 87.0251L87.025 63.4584C80.5167 56.9501 69.9667 56.9501 63.4583 63.4584C56.95 69.9667 56.95 80.5167 63.4583 87.0251L87.025 110.592C90.2833 113.85 94.5417 115.475 98.8083 115.475C103.075 115.475 107.333 113.85 110.592 110.592C117.108 104.083 117.108 93.5417 110.592 87.0251Z" />
													<path d="M216.667 100C152.333 100 100 152.333 100 216.667C100 237.075 105.433 257.258 115.733 275.025C118.708 280.167 124.2 283.333 130.15 283.333H303.183C309.133 283.333 314.625 280.167 317.6 275.025C327.9 257.258 333.333 237.075 333.333 216.667C333.333 152.333 281 100 216.667 100ZM292.975 250H140.358C135.742 239.483 133.333 228.125 133.333 216.667C133.333 170.717 170.717 133.333 216.667 133.333C262.617 133.333 300 170.717 300 216.667C300 228.125 297.592 239.483 292.975 250Z" />
													<path d="M254.883 354.883L233.333 376.433V333.333C233.333 324.133 225.867 316.667 216.667 316.667C207.458 316.667 200 324.133 200 333.333V376.433L178.45 354.883C171.942 348.375 161.392 348.375 154.883 354.883C148.375 361.392 148.375 371.942 154.883 378.45L204.883 428.45C208.142 431.708 212.4 433.333 216.667 433.333C220.933 433.333 225.192 431.708 228.45 428.45L278.45 378.45C284.958 371.942 284.958 361.392 278.45 354.883C271.942 348.375 261.392 348.375 254.883 354.883Z" />
												</svg>
												{
													weatherData ?
														<p className="font-inter text-neutral-300">{formatTime(weatherData.sys.sunset)}</p> :
														<p className="font-inter text-neutral-300">0:00 PM</p>
												}
											</div>
											<button onClick={() => { isFavorite ? removeFavoriteLocation() : setFavoriteLocation() }} className='bg-zinc-800 rounded-md p-3 xs:ml-0 ml-10 group hover:bg-zinc-700 transition-all'>
												<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 66 66" fill="none">
													<g clipPath="url(#clip0_207_5)">
														<path className={` transition-all ${isFavorite ? "fill-yellow-400" : "fill-zinc-400 group-hover:fill-yellow-500"}`} d="M65.1858 27.5528C65.9106 26.9162 66.1821 25.9096 65.876 24.9958C65.5699 24.0818 64.7452 23.4414 63.7838 23.3698L44.6204 21.9393C43.7303 21.8717 42.9531 21.3184 42.6021 20.5003L34.9912 2.85391C34.6089 1.97084 33.7341 1.3999 32.7705 1.41055C31.809 1.41944 30.9452 2.00344 30.5801 2.89527L23.2978 20.6801C22.9615 21.5053 22.1926 22.0739 21.3051 22.1561L2.16983 23.9404C1.21104 24.0293 0.398831 24.685 0.109997 25.6033C-0.178568 26.5216 0.112287 27.5247 0.845689 28.1473L15.509 40.5704C16.1888 41.148 16.4923 42.0529 16.2972 42.9215L12.0817 61.6719C11.8708 62.6119 12.242 63.5865 13.0278 64.1465C13.8137 64.7043 14.8554 64.7392 15.6761 64.2309L32.0193 54.1219C32.777 53.6535 33.7323 53.6443 34.5004 54.1005L51.0284 63.9034C51.8555 64.3941 52.8993 64.3421 53.6721 63.769C54.4451 63.1959 54.8011 62.2123 54.5708 61.2773L50.0121 42.6088C49.7993 41.7426 50.0858 40.8308 50.7545 40.243L65.1858 27.5528Z" />
													</g>
													<defs>
														<clipPath id="clip0_207_5">
															<rect width="66" height="66" fill="white" />
														</clipPath>
													</defs>
												</svg>
											</button>
										</div>
									</div>
									{
										weatherData ?
											<p className="font-inter text-lg text-neutral-400 sm:mt-0 mt-6">{capitalizeFirstLetter(weatherData.weather[0].description)}</p>
											:
											<p className="font-inter text-lg text-neutral-400">No Description</p>
									}
									<div className="mt-5 flex gap-8 flex-wrap">
										<div className="flex items-center gap-3 h-fit">
											<svg xmlns="http://www.w3.org/2000/svg" width="10" height="20" viewBox="0 0 334 734" className="fill-rose-500">
												<path d="M133.333 266.667C133.333 248.257 148.257 233.333 166.667 233.333C185.077 233.333 200 248.257 200 266.667V508.92C219.927 520.447 233.333 541.99 233.333 566.667C233.333 603.487 203.487 633.333 166.667 633.333C129.847 633.333 100 603.487 100 566.667C100 541.99 113.407 520.447 133.333 508.92V266.667Z" />
												<path fillRule="evenodd" clipRule="evenodd" d="M33.3333 466.667V133.333C33.3333 126.277 34.1916 119.175 35.3493 112.228C37.2756 100.67 41.1906 84.75 49.3523 68.4263C57.5796 51.972 70.4436 34.5037 90.3642 21.2233C110.493 7.804 135.833 0 166.667 0C197.5 0 222.84 7.804 242.97 21.2233C262.89 34.5037 275.753 51.972 283.98 68.4263C292.143 84.75 296.057 100.67 297.983 112.228C299.14 119.166 299.987 126.253 300 133.3V466.667C309.403 479.207 317.053 493.087 322.643 507.943C335.36 541.713 336.77 578.697 326.667 613.337C316.563 647.977 295.49 678.403 266.613 700.043C237.737 721.68 202.62 733.363 166.533 733.333C130.45 733.307 95.3509 721.567 66.5093 699.883C37.6679 678.2 16.6429 647.74 6.5936 613.083C-3.4554 578.427 -1.98574 541.447 10.7816 507.697C16.3669 492.933 23.9819 479.133 33.3333 466.667ZM99.9999 466.667V133.537C100.33 121.472 103.61 108.982 108.98 98.2403C113.253 89.6947 119.14 82.163 127.343 76.6933C135.34 71.3627 147.5 66.6667 166.667 66.6667C185.833 66.6667 197.993 71.3627 205.99 76.6933C214.193 82.163 220.08 89.6947 224.353 98.2403C229.703 108.941 232.927 121.323 233.327 133.321L233.333 466.667C233.333 480.23 236.59 492.48 245.273 503.243C251.987 511.563 257.377 520.947 261.193 531.08C268.897 551.543 269.753 573.957 263.63 594.95C257.507 615.943 244.737 634.383 227.237 647.497C209.737 660.61 188.453 667.69 166.587 667.67C144.72 667.653 123.447 660.54 105.97 647.4C88.4909 634.257 75.7492 615.8 69.6592 594.797C63.5692 573.793 64.4599 551.383 72.1973 530.93C76.0283 520.803 81.4356 511.427 88.1602 503.12C96.9366 492.277 99.9999 480.31 99.9999 466.667Z" />
											</svg>
											{
												weatherData ?
													(<p className="font-inter text-neutral-300">{temperatureMetric == "celsius" ? kelvinToCelsius(weatherData.main.temp) + "°C" : kelvinToFahrenheit(weatherData.main.temp) + "°F"}</p>) :
													(<p className="font-inter text-neutral-300">0.00°C</p>)
											}
										</div>
										<div className="flex items-center gap-3 h-fit">
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 91 119" className="fill-sky-400">
												<path d="M78.9241 37.3405L55.6863 5.20169C53.3232 1.93793 49.5338 0 45.5028 0C41.4684 0 37.6824 1.93793 35.3157 5.20169L12.0744 37.3405C-1.48069 58.5935 -6.38337 85.7323 12.0744 104.19C21.3069 113.423 33.4031 118.037 45.5028 118.037C57.5991 118.037 69.6953 113.423 78.9241 104.19C97.3856 85.7323 92.4792 58.5933 78.9241 37.3405Z" />
											</svg>
											{
												weatherData ?
													<p className="font-inter text-neutral-300">{weatherData.main.humidity}%</p> :
													<p className="font-inter text-neutral-300">0%</p>
											}
										</div>
										<div className="flex items-start gap-3 h-fit">
											<svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 176 175" className="fill-teal-400 mt-1">
												<path d="M70.3512 60.4325C70.5697 60.4325 70.7537 60.329 70.9665 60.3117C87.3482 59.961 100.499 46.5922 100.499 30.1587C100.499 13.501 86.9975 0 70.3398 0C56.5168 0 44.8672 9.29775 41.3022 21.9823L41.2505 22.195L41.1815 22.3388C40.5202 24.702 40.1407 27.416 40.135 30.222C40.135 34.1895 43.355 37.4095 47.3225 37.4095C51.29 37.4095 54.51 34.1895 54.51 30.222C54.51 28.7615 54.7112 27.3528 55.0792 26.013L55.0505 26.1223L55.085 26.0533C56.9652 19.2683 63.0832 14.3693 70.3512 14.3693C79.0855 14.3693 86.1637 21.4475 86.1637 30.1818C86.1637 38.916 79.0855 45.9943 70.3512 45.9943C70.242 45.9943 70.1557 46.0517 70.0465 46.0575L7.1875 45.9943C3.22 45.9943 0 49.2142 0 53.1817C0 57.1492 3.21425 60.3692 7.18175 60.3692L70.3455 60.4325H70.3512ZM136.298 23.6785C118.439 23.7015 103.391 35.7132 98.7678 52.095L98.6988 52.371L98.624 52.5205C97.7673 55.568 97.2728 59.0697 97.2728 62.6865C97.2728 62.698 97.2728 62.7037 97.2728 62.7152C97.2728 66.6827 100.493 69.9027 104.46 69.9027C108.428 69.9027 111.648 66.6827 111.648 62.7152C111.648 62.7037 111.648 62.6865 111.648 62.675C111.648 60.4152 111.958 58.2245 112.539 56.1487L112.499 56.3212L112.539 56.2465C115.466 45.6837 124.994 38.0592 136.304 38.0592C149.897 38.0592 160.919 49.082 160.919 62.675C160.919 76.268 149.897 87.2907 136.304 87.2907C136.154 87.2907 136.034 87.3655 135.89 87.377L18.9348 87.262C14.973 87.2793 11.7702 90.4878 11.7702 94.4495C11.7702 98.4113 14.973 101.62 18.929 101.637L136.304 101.752C136.609 101.706 136.873 101.654 137.132 101.585L137.086 101.597C158.275 101.177 175.289 83.8982 175.289 62.6462C175.289 41.1297 157.849 23.69 136.333 23.69C136.321 23.69 136.31 23.69 136.298 23.69V23.6785ZM126.23 106.709C126.052 106.663 125.827 106.611 125.597 106.576L125.563 106.571L18.9233 106.674C14.9558 106.674 11.7357 109.894 11.7357 113.862C11.7357 117.829 14.9558 121.049 18.9233 121.049L125.229 120.946C125.344 120.951 125.442 121.015 125.563 121.015C136.499 121.015 145.36 129.881 145.36 140.812C145.36 151.743 136.494 160.609 125.563 160.609C116.466 160.609 108.802 154.474 106.484 146.113L106.45 145.975L106.41 145.889C105.984 144.354 105.737 142.594 105.731 140.771C105.731 140.76 105.731 140.754 105.731 140.743C105.731 136.775 102.517 133.555 98.5435 133.555C94.5703 133.555 91.356 136.77 91.356 140.743C91.356 140.754 91.356 140.76 91.356 140.771C91.356 140.783 91.356 140.8 91.356 140.812C91.356 143.974 91.7873 147.033 92.5865 149.937L92.529 149.695C92.5578 149.793 92.621 149.862 92.6498 149.954C96.7725 164.519 109.952 175.007 125.574 175.007C144.44 175.007 159.735 159.712 159.735 140.846C159.735 122.211 144.814 107.059 126.264 106.691H126.23V106.709Z" />
											</svg>
											<div className="flex flex-col justify-start">
												{
													weatherData ?
														(
															<p className="font-inter text-neutral-300">{getDirection(weatherData.wind.deg)} {weatherData.wind.deg}°</p>
														) :
														(
															<p className="font-inter text-neutral-300">N 0°</p>
														)
												}
												{
													weatherData ?
														(
															<p className="font-inter text-neutral-300">{weatherData.wind.speed} meter/sec</p>
														) :
														(
															<p className="font-inter text-neutral-300">0.00 meter/sec</p>
														)
												}
											</div>
										</div>
									</div>
									<div className="flex flex-col mt-12 gap-5">
										<h2 className="font-inter font-medium text-neutral-300 text-lg">Next 5 Days Forecast</h2>
										<div className="grid gap-x-8 gap-y-5 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
											{
												forecastData ? forecastData.map((forecast) =>
													<div key={`forecast-${forecast.day}`} className="flex flex-col items-center w-full bg-zinc-800 rounded-lg border border-zinc-700 py-5 px-2">
														<p className="font-inter text-neutral-200 font-semibold text-lg">{forecast.day}</p>
														<img src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`} className="w-16"></img>
														<p className="font-inter text-neutral-300 text-lg">{capitalizeFirstLetter(forecast.weather[0].description)}</p>
														<div className="mt-5 flex flex-col gap-3">
															<div className="flex items-center gap-3 h-fit">
																<svg xmlns="http://www.w3.org/2000/svg" width="15" height="22" viewBox="0 0 334 734" className="fill-rose-500">
																	<path d="M133.333 266.667C133.333 248.257 148.257 233.333 166.667 233.333C185.077 233.333 200 248.257 200 266.667V508.92C219.927 520.447 233.333 541.99 233.333 566.667C233.333 603.487 203.487 633.333 166.667 633.333C129.847 633.333 100 603.487 100 566.667C100 541.99 113.407 520.447 133.333 508.92V266.667Z" />
																	<path fillRule="evenodd" clipRule="evenodd" d="M33.3333 466.667V133.333C33.3333 126.277 34.1916 119.175 35.3493 112.228C37.2756 100.67 41.1906 84.75 49.3523 68.4263C57.5796 51.972 70.4436 34.5037 90.3642 21.2233C110.493 7.804 135.833 0 166.667 0C197.5 0 222.84 7.804 242.97 21.2233C262.89 34.5037 275.753 51.972 283.98 68.4263C292.143 84.75 296.057 100.67 297.983 112.228C299.14 119.166 299.987 126.253 300 133.3V466.667C309.403 479.207 317.053 493.087 322.643 507.943C335.36 541.713 336.77 578.697 326.667 613.337C316.563 647.977 295.49 678.403 266.613 700.043C237.737 721.68 202.62 733.363 166.533 733.333C130.45 733.307 95.3509 721.567 66.5093 699.883C37.6679 678.2 16.6429 647.74 6.5936 613.083C-3.4554 578.427 -1.98574 541.447 10.7816 507.697C16.3669 492.933 23.9819 479.133 33.3333 466.667ZM99.9999 466.667V133.537C100.33 121.472 103.61 108.982 108.98 98.2403C113.253 89.6947 119.14 82.163 127.343 76.6933C135.34 71.3627 147.5 66.6667 166.667 66.6667C185.833 66.6667 197.993 71.3627 205.99 76.6933C214.193 82.163 220.08 89.6947 224.353 98.2403C229.703 108.941 232.927 121.323 233.327 133.321L233.333 466.667C233.333 480.23 236.59 492.48 245.273 503.243C251.987 511.563 257.377 520.947 261.193 531.08C268.897 551.543 269.753 573.957 263.63 594.95C257.507 615.943 244.737 634.383 227.237 647.497C209.737 660.61 188.453 667.69 166.587 667.67C144.72 667.653 123.447 660.54 105.97 647.4C88.4909 634.257 75.7492 615.8 69.6592 594.797C63.5692 573.793 64.4599 551.383 72.1973 530.93C76.0283 520.803 81.4356 511.427 88.1602 503.12C96.9366 492.277 99.9999 480.31 99.9999 466.667Z" />
																</svg>
																<p className="font-inter text-neutral-400">{temperatureMetric == "celsius" ? kelvinToCelsius(forecast.main.temp) + "°C" : kelvinToFahrenheit(forecast.main.temp) + "°F"}</p>
															</div>
															<div className="flex items-center gap-3 h-fit">
																<svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 91 119" className="fill-sky-400">
																	<path d="M78.9241 37.3405L55.6863 5.20169C53.3232 1.93793 49.5338 0 45.5028 0C41.4684 0 37.6824 1.93793 35.3157 5.20169L12.0744 37.3405C-1.48069 58.5935 -6.38337 85.7323 12.0744 104.19C21.3069 113.423 33.4031 118.037 45.5028 118.037C57.5991 118.037 69.6953 113.423 78.9241 104.19C97.3856 85.7323 92.4792 58.5933 78.9241 37.3405Z" />
																</svg>
																<p className="font-inter text-neutral-400">{forecast.main.humidity}%</p>
															</div>
															<div className="flex items-start gap-3 h-fit">
																<svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 176 175" className="fill-teal-400 mt-1">
																	<path d="M70.3512 60.4325C70.5697 60.4325 70.7537 60.329 70.9665 60.3117C87.3482 59.961 100.499 46.5922 100.499 30.1587C100.499 13.501 86.9975 0 70.3398 0C56.5168 0 44.8672 9.29775 41.3022 21.9823L41.2505 22.195L41.1815 22.3388C40.5202 24.702 40.1407 27.416 40.135 30.222C40.135 34.1895 43.355 37.4095 47.3225 37.4095C51.29 37.4095 54.51 34.1895 54.51 30.222C54.51 28.7615 54.7112 27.3528 55.0792 26.013L55.0505 26.1223L55.085 26.0533C56.9652 19.2683 63.0832 14.3693 70.3512 14.3693C79.0855 14.3693 86.1637 21.4475 86.1637 30.1818C86.1637 38.916 79.0855 45.9943 70.3512 45.9943C70.242 45.9943 70.1557 46.0517 70.0465 46.0575L7.1875 45.9943C3.22 45.9943 0 49.2142 0 53.1817C0 57.1492 3.21425 60.3692 7.18175 60.3692L70.3455 60.4325H70.3512ZM136.298 23.6785C118.439 23.7015 103.391 35.7132 98.7678 52.095L98.6988 52.371L98.624 52.5205C97.7673 55.568 97.2728 59.0697 97.2728 62.6865C97.2728 62.698 97.2728 62.7037 97.2728 62.7152C97.2728 66.6827 100.493 69.9027 104.46 69.9027C108.428 69.9027 111.648 66.6827 111.648 62.7152C111.648 62.7037 111.648 62.6865 111.648 62.675C111.648 60.4152 111.958 58.2245 112.539 56.1487L112.499 56.3212L112.539 56.2465C115.466 45.6837 124.994 38.0592 136.304 38.0592C149.897 38.0592 160.919 49.082 160.919 62.675C160.919 76.268 149.897 87.2907 136.304 87.2907C136.154 87.2907 136.034 87.3655 135.89 87.377L18.9348 87.262C14.973 87.2793 11.7702 90.4878 11.7702 94.4495C11.7702 98.4113 14.973 101.62 18.929 101.637L136.304 101.752C136.609 101.706 136.873 101.654 137.132 101.585L137.086 101.597C158.275 101.177 175.289 83.8982 175.289 62.6462C175.289 41.1297 157.849 23.69 136.333 23.69C136.321 23.69 136.31 23.69 136.298 23.69V23.6785ZM126.23 106.709C126.052 106.663 125.827 106.611 125.597 106.576L125.563 106.571L18.9233 106.674C14.9558 106.674 11.7357 109.894 11.7357 113.862C11.7357 117.829 14.9558 121.049 18.9233 121.049L125.229 120.946C125.344 120.951 125.442 121.015 125.563 121.015C136.499 121.015 145.36 129.881 145.36 140.812C145.36 151.743 136.494 160.609 125.563 160.609C116.466 160.609 108.802 154.474 106.484 146.113L106.45 145.975L106.41 145.889C105.984 144.354 105.737 142.594 105.731 140.771C105.731 140.76 105.731 140.754 105.731 140.743C105.731 136.775 102.517 133.555 98.5435 133.555C94.5703 133.555 91.356 136.77 91.356 140.743C91.356 140.754 91.356 140.76 91.356 140.771C91.356 140.783 91.356 140.8 91.356 140.812C91.356 143.974 91.7873 147.033 92.5865 149.937L92.529 149.695C92.5578 149.793 92.621 149.862 92.6498 149.954C96.7725 164.519 109.952 175.007 125.574 175.007C144.44 175.007 159.735 159.712 159.735 140.846C159.735 122.211 144.814 107.059 126.264 106.691H126.23V106.709Z" />
																</svg>
																<div className="flex flex-col justify-start">
																	<p className="font-inter text-neutral-400">{getDirection(forecast.wind.deg)} {forecast.wind.deg}</p>
																	<p className="font-inter text-neutral-400">{forecast.wind.speed} meter/sec</p>
																</div>
															</div>
														</div>
													</div>
												) :
													null
											}
										</div>
									</div>
									<div className="grid grid-cols-1 lg:grid-cols-2 lg:mt-15 xl:mt-20 mt-10 gap-5 w-full xl:pb-32 lg:pb-24 md:pb-20 sm:pb-16 pb-10">
										<div className='bg-zinc-800 border border-zinc-700 rounded-xl lg:p-5 xl:p-10 p-6'>
											<div className="flex items-center mb-10 gap-3">
												<svg xmlns="http://www.w3.org/2000/svg" width="10" height="20" viewBox="0 0 334 734" className="fill-rose-500">
													<path d="M133.333 266.667C133.333 248.257 148.257 233.333 166.667 233.333C185.077 233.333 200 248.257 200 266.667V508.92C219.927 520.447 233.333 541.99 233.333 566.667C233.333 603.487 203.487 633.333 166.667 633.333C129.847 633.333 100 603.487 100 566.667C100 541.99 113.407 520.447 133.333 508.92V266.667Z" />
													<path fillRule="evenodd" clipRule="evenodd" d="M33.3333 466.667V133.333C33.3333 126.277 34.1916 119.175 35.3493 112.228C37.2756 100.67 41.1906 84.75 49.3523 68.4263C57.5796 51.972 70.4436 34.5037 90.3642 21.2233C110.493 7.804 135.833 0 166.667 0C197.5 0 222.84 7.804 242.97 21.2233C262.89 34.5037 275.753 51.972 283.98 68.4263C292.143 84.75 296.057 100.67 297.983 112.228C299.14 119.166 299.987 126.253 300 133.3V466.667C309.403 479.207 317.053 493.087 322.643 507.943C335.36 541.713 336.77 578.697 326.667 613.337C316.563 647.977 295.49 678.403 266.613 700.043C237.737 721.68 202.62 733.363 166.533 733.333C130.45 733.307 95.3509 721.567 66.5093 699.883C37.6679 678.2 16.6429 647.74 6.5936 613.083C-3.4554 578.427 -1.98574 541.447 10.7816 507.697C16.3669 492.933 23.9819 479.133 33.3333 466.667ZM99.9999 466.667V133.537C100.33 121.472 103.61 108.982 108.98 98.2403C113.253 89.6947 119.14 82.163 127.343 76.6933C135.34 71.3627 147.5 66.6667 166.667 66.6667C185.833 66.6667 197.993 71.3627 205.99 76.6933C214.193 82.163 220.08 89.6947 224.353 98.2403C229.703 108.941 232.927 121.323 233.327 133.321L233.333 466.667C233.333 480.23 236.59 492.48 245.273 503.243C251.987 511.563 257.377 520.947 261.193 531.08C268.897 551.543 269.753 573.957 263.63 594.95C257.507 615.943 244.737 634.383 227.237 647.497C209.737 660.61 188.453 667.69 166.587 667.67C144.72 667.653 123.447 660.54 105.97 647.4C88.4909 634.257 75.7492 615.8 69.6592 594.797C63.5692 573.793 64.4599 551.383 72.1973 530.93C76.0283 520.803 81.4356 511.427 88.1602 503.12C96.9366 492.277 99.9999 480.31 99.9999 466.667Z" />
												</svg>
												<h3 className="font-inter text-lg font-medium text-neutral-200">Hourly Temperature Report ({currentDate.toLocaleDateString()})</h3>
											</div>
											{
												hourlyTemperatureData ?
													<LineChart legendText={`${temperatureMetric == "celsius" ? "Temperture (°C)" : "Temperature (°F)"}`} backgroundColor='rgba(216,58,86,0.2)'
														borderColor='rgba(253,63,97,1)' hourlyData={hourlyTemperatureData}></LineChart> :
													null
											}
										</div>
										<div className='bg-zinc-800 border border-zinc-700 rounded-xl p-6 lg:p-5 xl:p-10'>
											<div className="flex items-center mb-10 gap-3">
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 91 119" className="fill-sky-400">
													<path d="M78.9241 37.3405L55.6863 5.20169C53.3232 1.93793 49.5338 0 45.5028 0C41.4684 0 37.6824 1.93793 35.3157 5.20169L12.0744 37.3405C-1.48069 58.5935 -6.38337 85.7323 12.0744 104.19C21.3069 113.423 33.4031 118.037 45.5028 118.037C57.5991 118.037 69.6953 113.423 78.9241 104.19C97.3856 85.7323 92.4792 58.5933 78.9241 37.3405Z" />
												</svg>
												<h3 className="font-inter text-lg font-medium text-neutral-200">Hourly Humidity Report ({currentDate.toLocaleDateString()})</h3>
											</div>
											{
												hourlyHumidityData ?
													<LineChart legendText={"Humidity (%)"} backgroundColor='rgba(62,159,202,0.2)'
														borderColor='rgba(75,192,192,1)' hourlyData={hourlyHumidityData}></LineChart> :
													null
											}
										</div>
									</div>
								</div>

							</div>
						</PageWrapper>
					</div>
				) :
					<div className="w-full h-screen flex flex-col items-center justify-center gap-3">
						<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 96 96" className="fill-rose-500 mb-3">
							<g clipPath="url(#clip0_236_146)">
								<path d="M40.2277 36.3428C42.8379 38.145 46.4142 37.4893 48.2155 34.8792L62.5827 14.0669C64.4597 11.3476 68.1993 10.6626 70.9182 12.5404L81.8731 20.1028C83.1909 21.0123 84.0751 22.3803 84.3637 23.9545C84.6521 25.5288 84.3103 27.1213 83.4003 28.4386L69.0334 49.2504C67.2318 51.8604 67.8869 55.4366 70.4969 57.2381C71.493 57.9257 72.6291 58.2554 73.7539 58.2554C75.5772 58.2554 77.3705 57.3889 78.4847 55.7746L92.8513 34.9632C95.5038 31.1211 96.5011 26.4763 95.6599 21.8844C94.8185 17.2929 92.2395 13.3032 88.3973 10.6512L77.4428 3.08881C69.5118 -2.38633 58.6058 -0.388209 53.1313 7.54261L38.764 28.355C36.9623 30.9652 37.6174 34.541 40.2277 36.3428Z" />
								<path d="M49.2516 69.0323L28.4389 83.3998C27.1214 84.3097 25.5291 84.6522 23.9552 84.363C22.3809 84.0747 21.0129 83.19 20.1034 81.8726L12.5406 70.9177C10.6632 68.1984 11.3486 64.4588 14.0679 62.5818L34.88 48.2146C37.4901 46.413 38.1451 42.8369 36.3435 40.2268C34.542 37.6166 30.9655 36.9608 28.3558 38.7633L7.54338 53.1307C-0.387439 58.6055 -2.38556 69.5115 3.08942 77.4427L10.6524 88.3978C13.305 92.2395 17.2944 94.8187 21.8857 95.6601C22.9487 95.8548 24.014 95.9512 25.072 95.9512C28.5846 95.9509 32.0119 94.89 34.9644 92.8518L55.7765 78.4842C58.3865 76.6827 59.0416 73.1065 57.24 70.4965C55.4378 67.8858 51.8613 67.2301 49.2516 69.0323Z" />
								<path d="M66.8615 31.8193C64.3244 29.9167 60.7252 30.4309 58.8221 32.9677L47.7418 47.741L32.9678 58.8223C30.4307 60.725 29.9167 64.3245 31.8194 66.8613C32.9476 68.3656 34.6717 69.1584 36.4176 69.1584C37.6163 69.1584 38.8257 68.7848 39.8587 68.0097L55.2889 56.4364C55.7242 56.1101 56.1106 55.7233 56.4373 55.288L68.0103 39.8583C69.9128 37.3214 69.3986 33.7222 66.8615 31.8193Z" />
								<path d="M65.3098 73.5768L63.9394 91.3895C63.8924 92.035 63.989 92.721 64.2543 93.3596C65.1609 95.5433 67.6663 96.5783 69.8497 95.6716C72.0334 94.7649 73.0684 92.2595 72.1617 90.0758L65.3098 73.5768Z" />
								<path d="M95.9866 67.8783C95.8055 65.5211 93.7473 63.7572 91.3898 63.9387L73.5774 65.3087L90.0761 72.1603C90.6748 72.4066 91.357 72.5283 92.0464 72.4755C94.4039 72.2943 96.1678 70.2361 95.9866 67.8783Z" />
							</g>
							<defs>
								<clipPath id="clip0_236_146">
									<rect width="96" height="96" fill="white" />
								</clipPath>
							</defs>
						</svg>
						<h1 className="font-inter text-xl text-neutral-100 font-semibold">Place not found</h1>
						<p className="font-inter text-lg text-neutral-400 xs:hidden">Please search for another location</p>
						<button onClick={() => { history.back() }} className="mt-5 bg-amber-600 font-inter text-white py-2 px-8 rounded-md transition-all hover:bg-amber-700">
							<p className="xs:hidden">
								Back to previous page
							</p>
							<p className="xs:block hidden">
								Back
							</p>
						</button>
					</div>
			}

		</Page >
	)
}

export default IndexPage;

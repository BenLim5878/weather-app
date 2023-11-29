import NavBar from "../components/nav";
import Page from "../components/page";
import PageWrapper from "../components/pageWrapper";
import { useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { TemperatureMetricContext } from '../context/temperatureMetricContext';
import { SavedFavoriteContext } from '../context/savedFavoriteContext';

function IndexPage() {

	const router = useRouter()
	const { temperatureMetric, updateTemperatureMetric } = useContext(TemperatureMetricContext)
	const { savedFavorite, updateSavedFavorite } = useContext(SavedFavoriteContext)
	const landCoordinates = [
		{ lat: 40.7128, lng: -74.0060 }, // New York, USA
		{ lat: 48.8566, lng: 2.3522 },   // Paris, France
		{ lat: 35.6895, lng: 139.6917 }, // Tokyo, Japan
		{ lat: -33.8688, lng: 151.2093 }, // Sydney, Australia
		{ lat: 55.7558, lng: 37.6173 },   // Moscow, Russia
		{ lat: -22.9068, lng: -43.1729 }, // Rio de Janeiro, Brazil
		{ lat: 51.5074, lng: -0.1278 },   // London, UK
		{ lat: 34.0522, lng: -118.2437 }, // Los Angeles, USA
		{ lat: 28.6139, lng: 77.2090 },   // New Delhi, India
		{ lat: 39.9042, lng: 116.4074 },  // Beijing, China
		{ lat: -1.2921, lng: 36.8219 },   // Nairobi, Kenya
		{ lat: 41.9028, lng: 12.4964 },   // Rome, Italy
		{ lat: -34.6037, lng: -58.3816 }, // Buenos Aires, Argentina
		{ lat: 37.7749, lng: -122.4194 }, // San Francisco, USA
		{ lat: 30.0444, lng: 31.2357 },   // Cairo, Egypt
		{ lat: 1.3521, lng: 103.8198 },   // Singapore
		{ lat: 59.3293, lng: 18.0686 },   // Stockholm, Sweden
		{ lat: -26.2041, lng: 28.0473 },  // Johannesburg, South Africa
		{ lat: 19.4326, lng: -99.1332 },  // Mexico City, Mexico
		{ lat: 41.0082, lng: 28.9784 }    // Istanbul, Turkey
	];

	function getRandomLandCoordinate() {
		const index = Math.floor(Math.random() * landCoordinates.length);
		return landCoordinates[index];
	}

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
			<NavBar/>
			<PageWrapper>
				<div className="flex-col gap-8 sm:gap-12 md:gap-16 w-full h-full flex items-center justify-center">
					<img src="/img/weather-illustration.png" className="object-contain w-[500px]"></img>
					<div className="flex flex-col items-center gap-2 sm:gap-4">
						<p className="font-inter text-neutral-200 font-medium text-xl sm:text-2xl">Your Personal Weather Companion</p>
						<p className="font-inter text-neutral-400 text-md sm:text-lg">Accurate, Real-time Forecasts at Your Fingertips</p>
						<button className="text-md font-inter font-medium rounded-md text-neutral-800 bg-[#FAB264] p-3 px-6 transition-all hover:bg-[#be874b] mt-5" onClick={()=>{
							const randomCoord = getRandomLandCoordinate()
							router.push(`${randomCoord.lat}/${randomCoord.lng}`)
						}}>Randomize Location</button>	
					</div>

				</div>
			</PageWrapper>
		</Page >

	)
}

export default IndexPage;

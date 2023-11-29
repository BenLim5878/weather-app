import "tailwindcss/tailwind.css";
import "../styles/globals.css"
import "../styles/index.css";
import {TemperatureMetricProvider} from "../context/temperatureMetricContext"
import { SavedFavoriteProvider } from "../context/savedFavoriteContext";

function App({ Component, pageProps }) {
	return (
		<TemperatureMetricProvider>
			<SavedFavoriteProvider>
				<Component {...pageProps} />
			</SavedFavoriteProvider>
		</TemperatureMetricProvider>)
}

export default App;

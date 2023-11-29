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
            <PageWrapper hasNavBar={false}>
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
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
                    <h1 className="font-inter text-xl text-neutral-100 font-semibold">Page not found</h1>
                    <p className="font-inter text-lg text-neutral-400 block xs:hidden">Please try from another URL links</p>
                    <button onClick={() => { history.back() }} className="mt-5 bg-amber-600 font-inter text-white py-2 px-8 rounded-md transition-all hover:bg-amber-700">
                        <p className="xs:hidden">
                            Back to previous page
                        </p>
                        <p className="xs:block hidden">
                            Back
                        </p>
                    </button>
                </div>
            </PageWrapper>
        </Page >

    )
}

export default IndexPage;

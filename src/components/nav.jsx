import React, { useContext, useEffect, useState, useRef } from 'react'
import GoogleServiceProvider from './googleServiceProvider'
import { useRouter } from 'next/router';
import { TemperatureMetricContext } from '../context/temperatureMetricContext';
import { SavedFavoriteContext } from '../context/savedFavoriteContext';
import Link from 'next/link';

export default function NavBar({ hasSearchBar = true }) {

    const router = useRouter()
    const locationInputRef = useRef(null);
    const { temperatureMetric, updateTemperatureMetric } = useContext(TemperatureMetricContext)
    const { savedFavorite, updateSavedFavorite } = useContext(SavedFavoriteContext)
    const [isSavedFavoriteMenuShown, setIsSavedFavoriteMenuShown] = useState(false)
    const [savedFavouriteCount, setSavedFavoriteCount] = useState(0)

    function initAutocomplete() {
        if (!locationInputRef.current) return;

        const autocomplete = null
        autocomplete = new google.maps.places.Autocomplete(locationInputRef.current);

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }

            const latitude = place.geometry.location.lat();
            const longitude = place.geometry.location.lng();

            router.push(`/${latitude}/${longitude}`);
            locationInputRef.current.value = "";
        });
    }

    useEffect(() => {
        if (typeof google !== 'undefined') {
            initAutocomplete();
        } else {
        }
    }, [router.asPath]);

    useEffect(() => {
        setSavedFavoriteCount(savedFavorite.length)
    }, [savedFavorite])
    {
        return (
            <GoogleServiceProvider>
                <nav className={`w-full h-fit py-4 fixed top-0 left-0 z-50 transition border-b border-zinc-700 bg-zinc-900`}>
                    <section className="w-4/5 h-12 mx-auto flex items-center relative flex-row justify-between">
                        <Link href={"/"}>
                            <div>
                                <div className='items-center gap-3 cursor-pointer hidden xl:flex'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 73 73" fill="none">
                                        <path d="M61.969 46.9379L72.6046 36.3023L61.969 25.6667V10.6356H46.9379L36.3023 0L25.6667 10.6356H10.6356V25.6667L0 36.3023L10.6356 46.9379V61.969H25.6667L36.3023 72.6046L46.9379 61.969H61.969V46.9379V46.9379ZM36.3023 55.5523V17.0523C46.9379 17.0523 55.5523 25.6667 55.5523 36.3023C55.5523 46.9379 46.9379 55.5523 36.3023 55.5523Z" fill="#FAB264" />
                                    </svg>
                                    <div className='items-start gap-1 flex'>
                                        <h1 className='font-manrope font-medium text-lg text-neutral-200'>WeatherOutlook</h1>
                                        <p className='text-neutral-200'>™</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                        {
                            hasSearchBar ?
                                <div className="flex absolute top-1/2 xl:left-1/2 xl:-translate-x-1/2 -translate-y-1/2  border-l border-t border-b border- border-zinc-700 rounded-md items-center w-full sm:w-[300px] md:w-[425px] lg:w-[600px] h-5/6">
                                    <input ref={locationInputRef} autoComplete='off' id='location-input' className='font-inter bg-zinc-800 py-2 px-3 text-neutral-200 text-[0.955rem] outline-none w-full h-full placeholder:text-neutral-400' placeholder='Seach Place...'>
                                    </input>
                                    <div className='w-12 h-full flex justify-center items-center bg-zinc-700 rounded-tr-md rounded-br-md'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48" fill="none">
                                            <g clipPath="url(#clip0_114_160)">
                                                <path d="M31 28H29.41L28.86 27.45C30.82 25.18 32 22.23 32 19C32 11.82 26.18 6 19 6C11.82 6 6 11.82 6 19C6 26.18 11.82 32 19 32C22.23 32 25.18 30.82 27.45 28.87L28 29.42V31L38 40.98L40.98 38L31 28ZM19 28C14.03 28 10 23.97 10 19C10 14.03 14.03 10 19 10C23.97 10 28 14.03 28 19C28 23.97 23.97 28 19 28Z" fill='#D37A6B' />
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_114_160">
                                                    <rect width="48" height="48" fill="white" />
                                                </clipPath>
                                            </defs>
                                        </svg>
                                    </div>
                                </div> :
                                <></>
                        }
                        <div className="flex xs:flex-col-reverse xs:items-end items-center xs:gap-5 gap-10 sm:relative absolute right-0 top-20 sm:top-0">
                            <div className={`bg-zinc-700 rounded-md p-3 relative transition-all ${savedFavouriteCount > 0 ? "cursor-pointer hover:bg-zinc-800" : ""}`} onClick={() => setIsSavedFavoriteMenuShown(!isSavedFavoriteMenuShown)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 66 66" fill="none">
                                    <g clipPath="url(#clip0_207_5)">
                                        {
                                            savedFavouriteCount > 0 ?
                                                <path className='fill-yellow-300' d="M65.1858 27.5528C65.9106 26.9162 66.1821 25.9096 65.876 24.9958C65.5699 24.0818 64.7452 23.4414 63.7838 23.3698L44.6204 21.9393C43.7303 21.8717 42.9531 21.3184 42.6021 20.5003L34.9912 2.85391C34.6089 1.97084 33.7341 1.3999 32.7705 1.41055C31.809 1.41944 30.9452 2.00344 30.5801 2.89527L23.2978 20.6801C22.9615 21.5053 22.1926 22.0739 21.3051 22.1561L2.16983 23.9404C1.21104 24.0293 0.398831 24.685 0.109997 25.6033C-0.178568 26.5216 0.112287 27.5247 0.845689 28.1473L15.509 40.5704C16.1888 41.148 16.4923 42.0529 16.2972 42.9215L12.0817 61.6719C11.8708 62.6119 12.242 63.5865 13.0278 64.1465C13.8137 64.7043 14.8554 64.7392 15.6761 64.2309L32.0193 54.1219C32.777 53.6535 33.7323 53.6443 34.5004 54.1005L51.0284 63.9034C51.8555 64.3941 52.8993 64.3421 53.6721 63.769C54.4451 63.1959 54.8011 62.2123 54.5708 61.2773L50.0121 42.6088C49.7993 41.7426 50.0858 40.8308 50.7545 40.243L65.1858 27.5528Z" /> :
                                                <path className='fill-neutral-300' d="M65.1858 27.5528C65.9106 26.9162 66.1821 25.9096 65.876 24.9958C65.5699 24.0818 64.7452 23.4414 63.7838 23.3698L44.6204 21.9393C43.7303 21.8717 42.9531 21.3184 42.6021 20.5003L34.9912 2.85391C34.6089 1.97084 33.7341 1.3999 32.7705 1.41055C31.809 1.41944 30.9452 2.00344 30.5801 2.89527L23.2978 20.6801C22.9615 21.5053 22.1926 22.0739 21.3051 22.1561L2.16983 23.9404C1.21104 24.0293 0.398831 24.685 0.109997 25.6033C-0.178568 26.5216 0.112287 27.5247 0.845689 28.1473L15.509 40.5704C16.1888 41.148 16.4923 42.0529 16.2972 42.9215L12.0817 61.6719C11.8708 62.6119 12.242 63.5865 13.0278 64.1465C13.8137 64.7043 14.8554 64.7392 15.6761 64.2309L32.0193 54.1219C32.777 53.6535 33.7323 53.6443 34.5004 54.1005L51.0284 63.9034C51.8555 64.3941 52.8993 64.3421 53.6721 63.769C54.4451 63.1959 54.8011 62.2123 54.5708 61.2773L50.0121 42.6088C49.7993 41.7426 50.0858 40.8308 50.7545 40.243L65.1858 27.5528Z" />
                                        }
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_207_5">
                                            <rect width="66" height="66" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <div className={`-mt-9 ml-4 rounded-full ${savedFavouriteCount > 0 ? "bg-yellow-300 fixed" : "hidden"} px-[4px]`}>
                                    <p className='font-inter text-xs text-neutral-800'>{savedFavouriteCount}</p>
                                </div>
                                {
                                    (isSavedFavoriteMenuShown && (savedFavouriteCount > 0)) ?
                                        <div className={`absolute bg-zinc-800 rounded-lg border border-zinc-700 flex flex-col mt-5 sm:-ml-64 sm:left-0 sm:translate-x-0 -left-1/2 -translate-x-1/2 xs:translate-x-0 xs:-left-[173px]`}>
                                            {
                                                savedFavorite.map((location) =>
                                                    <Link key={`${location.lat}/${location.lng}`} href={`/${location.lat}/${location.lng}`}>
                                                        <button className='flex gap-5 items-center transition-all hover:bg-zinc-700 rounded px-4 py-3' onClick={locationInputRef.current.value = ""}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 66 66" fill="none">
                                                                <g clipPath="url(#clip0_207_5)">
                                                                    <path className='fill-yellow-300' d="M65.1858 27.5528C65.9106 26.9162 66.1821 25.9096 65.876 24.9958C65.5699 24.0818 64.7452 23.4414 63.7838 23.3698L44.6204 21.9393C43.7303 21.8717 42.9531 21.3184 42.6021 20.5003L34.9912 2.85391C34.6089 1.97084 33.7341 1.3999 32.7705 1.41055C31.809 1.41944 30.9452 2.00344 30.5801 2.89527L23.2978 20.6801C22.9615 21.5053 22.1926 22.0739 21.3051 22.1561L2.16983 23.9404C1.21104 24.0293 0.398831 24.685 0.109997 25.6033C-0.178568 26.5216 0.112287 27.5247 0.845689 28.1473L15.509 40.5704C16.1888 41.148 16.4923 42.0529 16.2972 42.9215L12.0817 61.6719C11.8708 62.6119 12.242 63.5865 13.0278 64.1465C13.8137 64.7043 14.8554 64.7392 15.6761 64.2309L32.0193 54.1219C32.777 53.6535 33.7323 53.6443 34.5004 54.1005L51.0284 63.9034C51.8555 64.3941 52.8993 64.3421 53.6721 63.769C54.4451 63.1959 54.8011 62.2123 54.5708 61.2773L50.0121 42.6088C49.7993 41.7426 50.0858 40.8308 50.7545 40.243L65.1858 27.5528Z" />
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0_207_5">
                                                                        <rect width="66" height="66" fill="white" />
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>
                                                            <div className='flex flex-col items-start gap-1'>
                                                                <p className='sm:max-w-[16rem] max-w-[8rem] text-inter font-medium text-neutral-200 text-left truncate text-ellipsis'>{location.locationName}</p>
                                                                <p className='sm:max-w-[16rem] max-ws-[8rem] text-inter text-neutral-300 truncate'>{location.lat}, {location.lng}</p>
                                                            </div>
                                                        </button>
                                                    </Link>
                                                )
                                            }
                                        </div> :
                                        <></>
                                }
                            </div>
                            <div className='flex items-center'>
                                <button onClick={() => updateTemperatureMetric("celsius")} className={`${temperatureMetric == "celsius" ? "bg-[#D37A6B] hover:bg-[#8f5247]" : "bg-zinc-700"} p-3 rounded-tl-md rounded-bl-md transition-all`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 69 69" fill="none">
                                        <path className='fill-neutral-200' d="M28.75 43.125C28.7496 46.2769 29.6128 49.3686 31.2459 52.0645C32.8789 54.7603 35.2194 56.9572 38.013 58.4166C40.8067 59.8759 43.9468 60.542 47.0924 60.3424C50.2379 60.1428 53.2687 59.0851 55.8555 57.2844C56.1647 57.0592 56.5157 56.898 56.8879 56.8101C57.2602 56.7223 57.6463 56.7097 58.0235 56.7729C58.4007 56.8361 58.7615 56.974 59.0848 57.1785C59.408 57.3829 59.6873 57.6498 59.9061 57.9635C60.1249 58.2772 60.2789 58.6314 60.3592 59.0054C60.4394 59.3794 60.4442 59.7656 60.3732 60.1414C60.3023 60.5173 60.1571 60.8752 59.9461 61.1942C59.7351 61.5133 59.4626 61.787 59.1445 61.9994C55.6957 64.401 51.6549 65.8118 47.4607 66.0786C43.2666 66.3454 39.0796 65.4579 35.3543 63.5126C31.6291 61.5672 28.508 58.6384 26.3301 55.0441C24.1522 51.4499 23.0008 47.3276 23.0008 43.125C23.0008 38.9224 24.1522 34.8001 26.3301 31.2059C28.508 27.6116 31.6291 24.6828 35.3543 22.7374C39.0796 20.7921 43.2666 19.9046 47.4607 20.1714C51.6549 20.4382 55.6957 21.849 59.1445 24.2506C59.4626 24.463 59.7351 24.7367 59.9461 25.0558C60.1571 25.3748 60.3023 25.7327 60.3732 26.1086C60.4442 26.4844 60.4394 26.8706 60.3592 27.2446C60.2789 27.6186 60.1249 27.9728 59.9061 28.2865C59.6873 28.6002 59.408 28.8671 59.0848 29.0715C58.7615 29.276 58.4007 29.4139 58.0235 29.4771C57.6463 29.5403 57.2602 29.5277 56.8879 29.4399C56.5157 29.352 56.1647 29.1908 55.8555 28.9656C53.2687 27.1648 50.2379 26.1072 47.0924 25.9076C43.9468 25.708 40.8067 26.3741 38.013 27.8334C35.2194 29.2928 32.8789 31.4897 31.2459 34.1855C29.6128 36.8814 28.7496 39.9731 28.75 43.125ZM28.75 12.9375C28.75 14.9277 28.1598 16.8732 27.0542 18.5279C25.9485 20.1827 24.3769 21.4724 22.5383 22.234C20.6996 22.9956 18.6763 23.1949 16.7244 22.8067C14.7725 22.4184 12.9795 21.46 11.5722 20.0528C10.165 18.6455 9.20662 16.8525 8.81835 14.9006C8.43009 12.9487 8.62936 10.9254 9.39097 9.08675C10.1526 7.24807 11.4423 5.67652 13.0971 4.57084C14.7518 3.46516 16.6973 2.875 18.6875 2.875C21.3562 2.875 23.9157 3.93515 25.8028 5.82224C27.6899 7.70932 28.75 10.2688 28.75 12.9375ZM23 12.9375C23 12.0846 22.7471 11.2508 22.2732 10.5416C21.7994 9.83242 21.1258 9.27967 20.3378 8.95327C19.5498 8.62687 18.6827 8.54147 17.8462 8.70786C17.0096 8.87426 16.2412 9.28499 15.6381 9.8881C15.035 10.4912 14.6243 11.2596 14.4579 12.0962C14.2915 12.9327 14.3769 13.7998 14.7033 14.5878C15.0297 15.3758 15.5824 16.0493 16.2916 16.5232C17.0008 16.9971 17.8346 17.25 18.6875 17.25C19.8313 17.25 20.9282 16.7956 21.7369 15.9869C22.5457 15.1781 23 14.0812 23 12.9375Z" />
                                    </svg>
                                </button>
                                <button onClick={() => updateTemperatureMetric("fahrenheit")} className={`${temperatureMetric == "fahrenheit" ? "bg-[#D37A6B] hover:bg-[#8f5247]" : "bg-zinc-700 hover:bg-zinc-800"} p-3 rounded-tr-md rounded-br-md transition-all`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 63 63" fill="none">
                                        <path className='fill-neutral-200' d="M17.0625 2.625C15.2454 2.625 13.4691 3.16384 11.9582 4.17337C10.4473 5.18291 9.26974 6.6178 8.57436 8.2966C7.87898 9.97539 7.69704 11.8227 8.05154 13.6049C8.40604 15.3871 9.28107 17.0241 10.566 18.309C11.8509 19.5939 13.4879 20.469 15.2701 20.8235C17.0523 21.178 18.8996 20.996 20.5784 20.3006C22.2572 19.6053 23.6921 18.4277 24.7016 16.9168C25.7112 15.4059 26.25 13.6296 26.25 11.8125C26.25 9.37582 25.282 7.03895 23.559 5.31596C21.8361 3.59297 19.4992 2.625 17.0625 2.625ZM17.0625 15.75C16.2837 15.75 15.5225 15.5191 14.8749 15.0864C14.2274 14.6538 13.7227 14.0388 13.4247 13.3193C13.1267 12.5998 13.0487 11.8081 13.2007 11.0443C13.3526 10.2805 13.7276 9.57894 14.2783 9.02827C14.8289 8.4776 15.5305 8.10259 16.2943 7.95066C17.0581 7.79873 17.8498 7.8767 18.5693 8.17472C19.2888 8.47274 19.9038 8.97742 20.3364 9.62494C20.7691 10.2725 21 11.0337 21 11.8125C21 12.8568 20.5852 13.8583 19.8467 14.5967C19.1083 15.3352 18.1068 15.75 17.0625 15.75ZM34.125 26.25V36.75H52.5C53.1962 36.75 53.8639 37.0266 54.3562 37.5188C54.8484 38.0111 55.125 38.6788 55.125 39.375C55.125 40.0712 54.8484 40.7389 54.3562 41.2312C53.8639 41.7234 53.1962 42 52.5 42H34.125V57.75C34.125 58.4462 33.8484 59.1139 33.3562 59.6062C32.8639 60.0984 32.1962 60.375 31.5 60.375C30.8038 60.375 30.1361 60.0984 29.6439 59.6062C29.1516 59.1139 28.875 58.4462 28.875 57.75V23.625C28.875 22.9288 29.1516 22.2611 29.6439 21.7688C30.1361 21.2766 30.8038 21 31.5 21H52.5C53.1962 21 53.8639 21.2766 54.3562 21.7688C54.8484 22.2611 55.125 22.9288 55.125 23.625C55.125 24.3212 54.8484 24.9889 54.3562 25.4812C53.8639 25.9734 53.1962 26.25 52.5 26.25H34.125Z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </section>
                </nav>
            </GoogleServiceProvider>
        )
    }
}

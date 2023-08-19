import { View, Text,Image, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../theme'
import { MagnifyingGlassIcon} from 'react-native-heroicons/outline'
import { MapPinIcon, CalendarDaysIcon} from 'react-native-heroicons/solid'
import { debounce } from "lodash";
import { fetchLocations, fetchWeatherForecast } from '../api/weather'
import { weatherImages } from '../constants'
import * as Progress from 'react-native-progress';
import { storeData, getData } from '../utils/asyncStorage'

const HomeScreen = () => {
    const [showSearch, toggleShowSearch] = useState(false);
    const [locations, setLocations] = useState([]);
    const [weather, setWeather] = useState({});
    const [loading, setLoading] = useState(true);

    const {location, current} = weather;
    const handleLocation = (loc) => {
        console.log('location', loc);
        setLocations([]);
        toggleShowSearch(false);
        setLoading(true)
        fetchWeatherForecast({cityName:loc.name , days:'7' }).then(data => {
            setLoading(false)
            setWeather(data);
            storeData('city', loc)
        })
    }
    const handleSearch = value => {
        console.log('value', value);
        if(value.length>2){
            fetchLocations({cityName: value}).then(data => {
                setLocations(data);
            })
        }
    }
    const fetchMyWeatherData = async ()=>{
        let myCity = await getData('city');
        let cityName = 'Alexandria';
            if(myCity){
                cityName = myCity;
            }
            fetchWeatherForecast({
                cityName,
                days: '7'
                }).then(data=>{
                // console.log('got data: ',data.forecast.forecastday);
                setWeather(data);
                setLoading(false);
                })
        }
        useEffect(() => {
            fetchMyWeatherData();
        }, [])

    const handleTextDebounce = useCallback(debounce(handleSearch,1200),[])
    return (
        <View className='flex-1 relative'>
            <StatusBar style='light'/>
            <Image 
                source={require('../assets/images/bg.png')}
                className= 'h-full w-full absolute'
                blurRadius={70}
            />
            {
                loading?(
                    <View className="flex-1 flex-row justify-center items-center">
                        <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
                    </View>
                ):(
                    <SafeAreaView className='flex flex-1'>
                <View className='mx-4 relative z-50 mt-3' style={{height:'7%'}}>
                    <View 
                        className='rounded-full items-center flex-row'
                        style={{backgroundColor: showSearch? theme.bgWhite(0.2):'transparent'}}
                    >
                        {
                            showSearch ? (
                                <TextInput
                                    onChangeText={handleTextDebounce} 
                                    placeholder='Search City' 
                                    placeholderTextColor={'lightgray'}
                                    className='h-10 pl-6 text-white text-base flex-1'
                                />
                            ): null
                        }
                        
                        <TouchableOpacity 
                            className='rounded-full p-3 m-1 justify-end items-center' 
                            style={{backgroundColor: theme.bgWhite(0.3)}}
                            onPress={() => toggleShowSearch(!showSearch)}
                        >
                            <MagnifyingGlassIcon size='30' color='white'/>
                        </TouchableOpacity>
                    </View>
                    {
                        locations.length > 0 && showSearch? (
                            <View className= 'absolute w-full bg-gray-300 top-16 rounded-3xl'>
                                {
                                    locations.map((loc, index) => {
                                        let showBorder = index+1 != locations.length;
                                        let borderClass = showBorder? 'border-b-2 border-b-gray-400':'';
                                        return(
                                            <TouchableOpacity
                                                onPress={() => handleLocation(loc)}
                                                key={index}
                                                className={"flex-row items-center border-0 p-3 px-4 mb-1 "+borderClass}
                                            >
                                                <MapPinIcon size={20} color='gray'/>
                                                <Text className="text-black text-lg ml-2">{loc?.name}, {loc?.country}</Text>
                                            </TouchableOpacity>
                                        )
                                    })
                                }
                            </View>
                        ):null
                    }
                </View>
                <View className='flex-1 justify-around mx-4 mb-2'>
                    <Text className="text-white text-center text-2xl font-bold" >{location?.name},
                        <Text className="text-lg font-semibold text-gray-300" >{" " +location?.country}</Text>
                    </Text>
                    <View className="flex-row justify-center">
                        <Image 
                            // source={{uri: 'https:'+current?.condition?.icon}} 
                            // source={require('../assets/images/partlycloudy.png')} 
                            source={weatherImages[current?.condition?.text]}
                            className="w-52 h-52" />
                </View>
                <View className="space-y-2">
                    <Text className="text-center font-bold text-white text-6xl ml-5">
                        {current?.temp_c}&#176;
                    </Text>
                    <Text className="text-center text-white text-xl tracking-widest">
                        {current?.condition?.text}
                    </Text>
                </View>

                {/* other stats */}
                <View className="flex-row justify-between mx-4">
                    <View className="flex-row space-x-2 items-center">
                        <Image source={require('../assets/icons/wind.png')} className="w-6 h-6" />
                        <Text className="text-white font-semibold text-base">{current?.wind_kph}km</Text>
                    </View>
                    <View className="flex-row space-x-2 items-center">
                        <Image source={require('../assets/icons/drop.png')} className="w-6 h-6" />
                        <Text className="text-white font-semibold text-base">{current?.humidity}%</Text>
                    </View>
                    <View className="flex-row space-x-2 items-center">
                        <Image source={require('../assets/icons/sun.png')} className="w-6 h-6" />
                    <Text className="text-white font-semibold text-base">
                        6:05 AM
                    </Text>
                    </View>
                    </View>
                </View>
                <View className="mb-2 space-y-3">
                    <View className="flex-row items-center mx-5 space-x-2">
                        <CalendarDaysIcon size="22" color="white" />
                        <Text className="text-white text-base">Daily forecast</Text>
                    </View>
                    <ScrollView   
                        horizontal
                        contentContainerStyle={{paddingHorizontal: 15}}
                        showsHorizontalScrollIndicator={false}
                    >
                        {
                            weather?.forecast?.forecastday?.map((item, index) => {
                                const date = new Date(item.date);
                                const options = { weekday: 'long' };
                                let dayName = date.toLocaleDateString('en-US', options);
                                dayName = dayName.split(',')[0];
                                return(
                                    <View
                                        key={index} 
                                        className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4" 
                                        style={{backgroundColor: theme.bgWhite(0.15)}}
                                    >
                                        <Image
                                            source={weatherImages[item?.day?.condition?.text]}
                                            className="w-11 h-11" />
                                        <Text className="text-white">{dayName}</Text>
                                        <Text className="text-white text-xl font-semibold">
                                            {item?.day?.avgtemp_c}&#176;
                                        </Text>
                                    
                                    </View>
                                )
                            })
                        }
                    </ScrollView>
                </View>
            </SafeAreaView>
                )
            }
            
        </View>
    )
}

export default HomeScreen;
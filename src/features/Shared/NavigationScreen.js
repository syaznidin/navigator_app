import React, { useState, useEffect, useCallback, createRef } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes, faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import { Order, Place } from '@fleetbase/sdk';
import { useMountedState, useLocale, useDriver, useFleetbase } from 'hooks';
import { getCurrentLocation, formatCurrency, formatKm, formatDistance, calculatePercentage, translate, logError, isEmpty, isArray, getColorCode, titleize, formatMetaValue } from 'utils';
import { format } from 'date-fns';
import MapboxNavigation from '@homee/react-native-mapbox-navigation';
import FastImage from 'react-native-fast-image';
import OrderStatusBadge from 'components/OrderStatusBadge';
import tailwind from 'tailwind';
import { Linking } from 'react-native';

const NavigationScreen = ({ navigation, route }) => {
    const { _order, _destination } = route.params;

    const insets = useSafeAreaInsets();
    const isMounted = useMountedState();
    const actionSheetRef = createRef();
    const fleetbase = useFleetbase();
    const [driver, setDriver] = useDriver();
    const [locale] = useLocale();

    const [order, setOrder] = useState(new Order(_order, fleetbase.getAdapter()));
    const [destination, setDestination] = useState(new Place(_destination, fleetbase.getAdapter()));
    const [origin, setOrigin] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    // const [longitude, latitude] = destination?.getAttribute('location.coordinates') || [];
    const extractOriginCoordinates = useCallback((_origin) => {
        if (_origin?.coordinates && isArray(_origin?.coordinates)) {
            return _origin?.coordinates?.reverse();
        }

        if (_origin?.coords && _origin?.coords?.latitude && _origin?.coords?.longitude) {
            return  [ _origin?.coords?.longitude, _origin?.coords?.latitude];
        }
    });

    const coords = {
        origin: extractOriginCoordinates(origin),
        destination: destination?.getAttribute('location.coordinates'),
    };

    const isReady = isArray(coords?.origin) && isArray(coords?.destination);

    const trackDriverLocation = useCallback((event) => {
        // const { distanceTraveled, durationRemaining, fractionTraveled, distanceRemaining } = event.nativeEvent;
        const { latitude, longitude } = event.nativeEvent;

        return driver.track({ latitude, longitude }).catch(logError);
    });

    useEffect(() => {
        getCurrentLocation().then(setOrigin).catch(logError);
    }, [isMounted]);

    // const openNavigationApp = () => {
    //     const wazeUrl = '...'; // your waze URL here
    //     const googleMapsUrl = '...'; // your Google Maps URL here

    //     Linking.canOpenURL(wazeUrl)
    //         .then((supported) => {
    //             if (supported) {
    //                 return Linking.openURL(wazeUrl);
    //             } else {
    //                 return Linking.openURL(googleMapsUrl);
    //             }
    //         })
    //         .catch((err) => console.error('An error occurred', err));
    // };

    return (
        <View style={[tailwind('bg-gray-800 h-full')]}>
            <View style={[tailwind('z-50 bg-gray-800 border-b border-gray-900 shadow-lg'), { paddingTop: insets.top }]}>
                <View style={tailwind('flex flex-row items-start justify-between px-4 py-2 overflow-hidden')}>
                    <View style={tailwind('flex-1 flex items-start')}>
                        <View style={tailwind('flex flex-row items-center')}>
                            <FontAwesomeIcon icon={faLocationArrow} style={tailwind('text-blue-100 mr-2')} />
                            <Text style={tailwind('text-xl font-semibold text-blue-100')}>Navigation</Text>
                        </View>
                        <Text style={tailwind('text-gray-50')} numberOfLines={1}>
                            {destination.getAttribute('address')}
                        </Text>
                    </View>
                    <View>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={tailwind('')}>
                            <View style={tailwind('rounded-full bg-gray-900 w-10 h-10 flex items-center justify-center')}>
                                <FontAwesomeIcon icon={faTimes} style={tailwind('text-red-400')} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            {/* <TouchableOpacity onPress={openNavigationApp} style={tailwind('m-4 p-2 bg-blue-500 rounded')}>
                <Text style={tailwind('text-white text-center')}>Open in Navigation App</Text>
            </TouchableOpacity> */}
            {isReady ? (
                <MapboxNavigation
                    origin={coords.origin}
                    destination={coords.destination}
                    showsEndOfRouteFeedback={true}
                    onLocationChange={trackDriverLocation}
                    onRouteProgressChange={(event) => {
                        const { distanceTraveled, durationRemaining, fractionTraveled, distanceRemaining } = event.nativeEvent;
                    }}
                    onError={(event) => {
                        const { message } = event.nativeEvent;
                    }}
                    onCancelNavigation={() => navigation.goBack()}
                    onArrive={() => {
                        // Called when you arrive at the destination.
                    }}
                />
            ) : (
                <View style={tailwind('flex items-center justify-center h-full w-full bg-gray-600 -mt-14')}>
                    <ActivityIndicator size={'large'} color={getColorCode('text-blue-300')} />
                </View>
            )}
        </View>
    );
};

export default NavigationScreen;

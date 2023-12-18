import React, { useEffect, useState } from 'react';
import { View, Text, RefreshControl, FlatList, TouchableOpacity } from 'react-native';
import { useDriver, useMountedState, useResourceCollection, useFleetbase } from 'hooks';
import { logError } from 'utils';
import { setI18nConfig } from 'utils/Localize';
import { tailwind } from 'tailwind';
import { format } from 'date-fns';
import { Order } from '@fleetbase/sdk';
import DefaultHeader from 'components/headers/DefaultHeader';
import OrdersFilterBar from 'components/OrdersFilterBar';
import config from 'config';

const WalletScreen = ({ navigation }) => {
    const isMounted = useMountedState();
    const fleetbase = useFleetbase();
    const [driver] = useDriver();

    const [date, setDateValue] = useState(new Date());
    const [params, setParams] = useState({
        driver: driver.id,
        on: format(date, 'dd-MM-yyyy'),
    });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isQuerying, setIsQuerying] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [orders, setOrders] = useResourceCollection(`orders_${format(date, 'yyyyMMdd')}`, Order, fleetbase.getAdapter());

    const setParam = (key, value) => {
        if (key === 'on') {
            setDateValue(value);
            value = format(value, 'dd-MM-yyyy');
        }

        params[key] = value;
        setParams({ ...params }); // Use spread operator to create a new object
    };

    const onRefresh = () => {
        setIsRefreshing(true);

        fleetbase.orders
            .query(params)
            .then(setOrders)
            .catch(logError)
            .finally(() => setIsRefreshing(false));
    };

    useEffect(() => {
        if (isLoaded) {
            setIsQuerying(true);
        }

        fleetbase.orders
            .query(params)
            .then(setOrders)
            .catch(logError)
            .finally(() => {
                setIsQuerying(false);
                setIsLoaded(true);
            });
    }, [isMounted, date]);

    // Render individual order item
    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleOrderPress(item)}>
            <View style={tailwind('p-4 bg-white mb-4 rounded-lg')}>
                <Text style={tailwind('font-bold text-xl')}>{item.title}</Text>
                <Text style={tailwind('text-gray-500')}>{item.description}</Text>
            </View>
        </TouchableOpacity>
    );

    // Handle order item press
    const handleOrderPress = (order) => {
        // Implement navigation to the order details screen or any desired action.
        // For example:
        // navigation.navigate('OrderDetails', { orderId: order.id });
    };

    return (
        <View style={[tailwind('bg-gray-900 h-full'), { paddingBottom: 147 }]}>
            <DefaultHeader />
            <OrdersFilterBar params={params} setParam={setParam} />
            <View style={[tailwind('bg-gray-900 h-full')]}
                data={orders}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                }
            />
        </View>
    );
};

export default WalletScreen;

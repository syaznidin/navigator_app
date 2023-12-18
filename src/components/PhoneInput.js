import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import { listCountries, translate, getColorCode } from 'utils';
import { useLocale } from 'hooks';
import tailwind from 'tailwind';
import ReactNativePickerModule from 'react-native-picker-module';

const isString = (string) => typeof string === 'string';
const isAndroid = Platform.OS === 'android';

const PhoneInput = (props) => {
    const pickerRef = useRef();

    const [locale] = useLocale();
    const [value, setValue] = useState(props.value ?? null);
    const [country, setCountry] = useState(props.country ?? null);

    const updatePhoneNumber = (input) => {
        // if manually entering country code
        if (isString(input) && input.startsWith('+')) {
            const manuallySetCountry = listCountries().find((country) => {
                // get default coutnry from value if starting with country code
                if (isString(input) && input.startsWith(`+${country.phone}`)) {
                    return country;
                }
            });

            if (manuallySetCountry) {
                setCountry(manuallySetCountry);

                // patch input
                input = input.replace(`+${manuallySetCountry.phone}`, '');
            }
        }

        setValue(input);

        if (typeof props.onChangeText === 'function') {
            props.onChangeText(`+${country?.phone || '1'}${input}`);
        }
    };

    const getDefaultCountry = () => {
        const defaultCountry = listCountries().find((country) => {
            // get default coutnry from value if starting with country code
            if (isString(value) && value.startsWith(`+${country.phone}`)) {
                return country;
            }

            if (isString(props.defaultCountry) && country.iso2 === props.defaultCountry) {
                return country;
            }
        });

        return defaultCountry;
    };

    const selectCountry = (countryCode) => {
        const selectedCountry = listCountries(countryCode);
        setCountry(selectedCountry);

        if (typeof props.onChangeText === 'function') {
            props.onChangeText(`+${selectedCountry.phone}${value}`);
        }
    };

    useEffect(() => {
        const defaultCountry = getDefaultCountry();
        setCountry(defaultCountry);

        if (defaultCountry && isString(value)) {
            setValue(value.replace(`+${defaultCountry.phone}`, ''));
        }
    }, []);

    return (
        <>
            <View style={[tailwind(`form-input ${isAndroid ? 'py-0.5' : 'py-2'} flex flex-row items-center`), { height: isAndroid ? 52 : 52 }, props.style || {}]}>
                <TouchableOpacity onPress={() => pickerRef.current.show()}>
                    <View style={tailwind('flex items-center justify-center mr-3')}>
                        <Text style={tailwind(`text-2xl`)}>{country?.emoji}</Text>
                    </View>
                </TouchableOpacity>
                <TextInput
                    value={value}
                    onChangeText={updatePhoneNumber}
                    keyboardType={'phone-pad'}
                    placeholder={props.placeholder || '+0 (000) 000 - 000'}
                    placeholderTextColor={getColorCode('text-gray-500')}
                    style={[tailwind('flex-1 text-gray-50'), props.inputStyle]}
                    disabled={props.disabled}
                />
            </View>
            <ReactNativePickerModule
                pickerRef={pickerRef}
                value={null}
                title={translate('components.interface.PhoneInput.selectCountry')}
                items={listCountries().map((c) => ({ label: `${c.emoji} (+${c.phone}) ${c.name}`, value: c.iso2 }))}
                selectedColor="#3485e2"
                onValueChange={selectCountry}
            />
        </>
    );
};

export default PhoneInput;

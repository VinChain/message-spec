import {Root as BaseMessage} from './root';

export const VERSION = 1;

export interface GenericId {
	provider: string;
	[name: string]: any;
}

export interface FmxxxxId extends GenericId {
	provider: 'fmxxxx';
	imei: string;
}

export interface Generic extends BaseMessage {
	apiVersion: 1;
	timestamp: number;
	id: GenericId | FmxxxxId;
	type: string;
}

export interface Location extends Generic {
	type: 'location';
	data: {
		latitude: number;
		longitude: number;
		altitude?: number;
		speed?: number;
		course?: number;
		satellites?: number;
	};
}

export interface Telemetry extends Generic {
	type: 'telemetry';
	data: {
		ignition?: boolean;
		movement?: boolean;
		speed?: number;
		engine_rpm?: number;
		total_odometer?: number;
		trip_odometer?: number;
		average_fuel_use?: number;
		fuel_level?: number;
		accelerometer?: {
			[name in 'x' | 'y' | 'z']: number;
		};
		battery_voltage?: number;
	};
}

export interface Vin extends Generic {
	type: 'vin';
	data: string | false;
}

export interface FaultCodes extends Generic {
	type: 'faultcodes';
	data: string[];
}

export interface FmxxxxIo extends Generic {
	id: FmxxxxId;
	type: 'io';
	data: {
		[name: number]: number;
	};
}

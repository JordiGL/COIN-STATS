import { writable } from 'svelte/store';

export const url = "https://api.binance.com/api/v1/ticker/24hr";

export const coinStore = writable([]);

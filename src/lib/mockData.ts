import { Assembler, AssemblyTask, Order, TaskStatus } from './types';

// Mock Locations (Auckland, New Zealand area for demo)
export const LOCATIONS = {
    WAREHOUSE: { lat: -36.9150, lng: 174.8385, address: 'IKEA Mt Wellington Distribution Center' },
    DOWNTOWN: { lat: -36.8485, lng: 174.7633, address: '123 Queen St, Auckland CBD' },
    PONSONBY: { lat: -36.8562, lng: 174.7460, address: '456 Ponsonby Rd, Ponsonby' },
    NEWMARKET: { lat: -36.8687, lng: 174.7770, address: '789 Broadway, Newmarket' },
    TAKAPUNA: { lat: -36.7877, lng: 174.7766, address: '101 Hurstmere Rd, Takapuna' },
    REMUERA: { lat: -36.8797, lng: 174.8055, address: '12 Remuera Rd, Remuera' },
};

export const MOCK_ASSEMBLERS: Assembler[] = [
    {
        id: 'a1',
        name: 'Bjorn Svensson',
        skills: ['EASY', 'MEDIUM', 'HARD'],
        rating: 5.0,
        currentLocation: { lat: -36.8500, lng: 174.7600, address: 'Near Viaduct' }, // Close to CBD
        availability: [],
        activeTaskId: null,
    },
    {
        id: 'a2',
        name: 'Sarah Connor',
        skills: ['EASY', 'MEDIUM'],
        rating: 4.8,
        currentLocation: { lat: -36.8550, lng: 174.7450, address: 'Freemans Bay' }, // Close to Ponsonby
        availability: [],
        activeTaskId: null,
    },
    {
        id: 'a3',
        name: 'Mike Ross',
        skills: ['EASY'],
        rating: 3.5,
        currentLocation: { lat: -36.7800, lng: 174.7700, address: 'Milford' }, // North Shore
        availability: [],
        activeTaskId: null,
    },
];

export const MOCK_ORDERS: Order[] = [
    {
        id: 'o1',
        customerName: 'Alice Johnson',
        address: LOCATIONS.DOWNTOWN,
        items: [{ id: 'i1', name: 'PAX Wardrobe', sku: '123.456.78', quantity: 1 }],
        deliveryWindow: { start: new Date(), end: new Date() }, // Today
    },
    {
        id: 'o2',
        customerName: 'Bob Smith',
        address: LOCATIONS.PONSONBY,
        items: [{ id: 'i2', name: 'BILLY Bookcase', sku: '987.654.32', quantity: 2 }],
        deliveryWindow: { start: new Date(), end: new Date() },
    },
    {
        id: 'o3',
        customerName: 'Charlie Davis',
        address: LOCATIONS.NEWMARKET,
        items: [{ id: 'i3', name: 'KALLAX Shelf', sku: '111.222.33', quantity: 1 }],
        deliveryWindow: { start: new Date(), end: new Date() },
    },
    // New Task added
    {
        id: 'o4',
        customerName: 'Diana Prince',
        address: LOCATIONS.REMUERA,
        items: [{ id: 'i4', name: 'TORNVIKEN Kitchen Island', sku: '555.666.77', quantity: 1 }],
        deliveryWindow: { start: new Date(), end: new Date() },
    },
];

export const MOCK_TASKS: AssemblyTask[] = [
    {
        id: 't1',
        orderId: 'o1',
        status: 'OPEN',
        requiredSkills: 'HARD', // PAX is hard
        estimatedDurationMinutes: 120,
        assignedAssemblerId: null,
        scheduledTime: null,
    },
    {
        id: 't2',
        orderId: 'o2',
        status: 'OPEN',
        requiredSkills: 'MEDIUM', // BILLY is medium
        estimatedDurationMinutes: 60,
        assignedAssemblerId: null,
        scheduledTime: null,
    },
    {
        id: 't3',
        orderId: 'o3',
        status: 'OPEN',
        requiredSkills: 'EASY', // KALLAX is easy
        estimatedDurationMinutes: 45,
        assignedAssemblerId: null,
        scheduledTime: null,
    },
    {
        id: 't4',
        orderId: 'o4',
        status: 'OPEN',
        requiredSkills: 'HARD', // Kitchen Island is hard
        estimatedDurationMinutes: 150,
        assignedAssemblerId: null,
        scheduledTime: null,
    },
];

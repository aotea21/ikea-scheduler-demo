import { Assembler, AssemblyTask, Order } from './types';

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
        ratingCount: 124,
        currentLocation: { lat: -36.8500, lng: 174.7600, address: 'Near Viaduct' }, // Close to CBD
        availability: [],
        activeTaskId: null,
        isActive: true,
        lastSeenAt: new Date(),
        mobileNumberPrimary: '021 555 0001'
    },
    {
        id: 'a2',
        name: 'Sarah Connor',
        skills: ['EASY', 'MEDIUM'],
        rating: 4.8,
        ratingCount: 89,
        currentLocation: { lat: -36.8550, lng: 174.7450, address: 'Freemans Bay' }, // Close to Ponsonby
        availability: [],
        activeTaskId: null,
        isActive: true,
        lastSeenAt: new Date(),
        mobileNumberPrimary: '022 555 0002'
    },
    {
        id: 'a3',
        name: 'Mike Ross',
        skills: ['EASY'],
        rating: 3.5,
        ratingCount: 42,
        currentLocation: { lat: -36.7800, lng: 174.7700, address: 'Milford' }, // North Shore
        availability: [],
        activeTaskId: null,
        isActive: false,
        lastSeenAt: new Date(Date.now() - 3600000), // 1 hour ago
        mobileNumberPrimary: '027 555 0003'
    },
    {
        id: 'a4',
        name: 'Jessica Pearson',
        skills: ['EASY', 'MEDIUM', 'HARD'],
        rating: 4.9,
        ratingCount: 210,
        currentLocation: { lat: -36.8600, lng: 174.7800, address: 'Remuera' },
        availability: [],
        activeTaskId: null,
        isActive: true,
        lastSeenAt: new Date(),
        mobileNumberPrimary: '021 555 0004'
    },
    {
        id: 'a5',
        name: 'Louis Litt',
        skills: ['EASY', 'MEDIUM'],
        rating: 4.2,
        ratingCount: 15,
        currentLocation: { lat: -36.9000, lng: 174.8000, address: 'Ellerslie' },
        availability: [],
        activeTaskId: null,
        isActive: true,
        lastSeenAt: new Date(),
        mobileNumberPrimary: '022 555 0005'
    },
    {
        id: 'a6',
        name: 'Donna Paulsen',
        skills: ['EASY', 'MEDIUM', 'HARD'],
        rating: 5.0,
        ratingCount: 300,
        currentLocation: { lat: -36.8400, lng: 174.7500, address: 'Downtown' },
        availability: [],
        activeTaskId: null,
        isActive: true,
        lastSeenAt: new Date(),
        mobileNumberPrimary: '027 555 0006'
    },
];

export const MOCK_ORDERS: Order[] = [
    {
        id: 'o1',
        customerName: 'Alice Johnson',
        address: LOCATIONS.DOWNTOWN,
        items: [{ id: 'i1', name: 'PAX Wardrobe', sku: '123.456.78', quantity: 1 }],
        customerPhone: '021 123 4567',
        email: 'alice.j@example.com',
        deliveryFrom: new Date(new Date().setHours(9, 0, 0)),
        deliveryTo: new Date(new Date().setHours(13, 0, 0)),
        deliveryDate: '2025-10-25', // Keeping for UI
        assemblyWindow: '09:00 - 13:00', // Keeping for UI
        estimatedTime: 120,
        serviceFee: 150.00,
        notes: 'Gate code: 1234. Please call on arrival.',
        status: 'DELIVERED',
        location: LOCATIONS.DOWNTOWN
    },
    {
        id: 'o2',
        customerName: 'Bob Smith',
        address: LOCATIONS.PONSONBY,
        items: [{ id: 'i2', name: 'BILLY Bookcase', sku: '987.654.32', quantity: 2 }],
        customerPhone: '022 987 6543',
        email: 'bob.smith@example.com',
        deliveryFrom: new Date(new Date().setHours(14, 0, 0)),
        deliveryTo: new Date(new Date().setHours(15, 30, 0)),
        deliveryDate: '2025-10-26',
        assemblyWindow: '14:00 - 15:30',
        estimatedTime: 60,
        serviceFee: 85.00,
        notes: 'Small dog on property, friendly.',
        status: 'DELIVERED',
        location: LOCATIONS.PONSONBY
    },
    {
        id: 'o3',
        customerName: 'Charlie Davis',
        address: LOCATIONS.NEWMARKET,
        items: [{ id: 'i3', name: 'KALLAX Shelf', sku: '111.222.33', quantity: 1 }],
        customerPhone: '027 555 1234',
        email: 'charlie.d@example.com',
        deliveryFrom: new Date(new Date().setHours(10, 0, 0)),
        deliveryTo: new Date(new Date().setHours(11, 0, 0)),
        deliveryDate: '2025-10-26',
        assemblyWindow: '10:00 - 11:00',
        estimatedTime: 45,
        serviceFee: 50.00,
        status: 'DELIVERED',
        location: LOCATIONS.NEWMARKET
    },
    {
        id: 'o4',
        customerName: 'Diana Prince',
        address: LOCATIONS.REMUERA,
        items: [{ id: 'i4', name: 'TORNVIKEN Kitchen Island', sku: '555.666.77', quantity: 1 }],
        customerPhone: '021 777 8888',
        email: 'diana.p@example.com',
        deliveryFrom: new Date(new Date().setHours(8, 0, 0)),
        deliveryTo: new Date(new Date().setHours(11, 0, 0)),
        deliveryDate: '2025-10-27',
        assemblyWindow: '08:00 - 11:00',
        estimatedTime: 150,
        serviceFee: 200.00,
        notes: 'Please use side entrance.',
        status: 'DELIVERED',
        location: LOCATIONS.REMUERA
    },
];

export const MOCK_TASKS: AssemblyTask[] = [
    {
        id: 't1',
        orderId: 'o1',
        status: 'ASSIGNED',
        skillRequired: 'HARD',
        requiredSkills: 'HARD',
        scheduledStart: new Date(Date.now() + 1000 * 60 * 60 * 2), // In 2 hours
        scheduledEnd: new Date(Date.now() + 1000 * 60 * 60 * 4),
        assignedAssemblerIds: ['a1'], // Array
        createdAt: new Date(),
        estimatedDurationMinutes: 120,
        scheduledTime: new Date(Date.now() + 1000 * 60 * 60 * 2),
        history: [
            { id: 'e1', taskId: 't1', type: 'ASSIGNED', eventTime: new Date(Date.now() - 3600000), location: { lat: -36.8485, lng: 174.7633, address: 'Previous Location' }, metadata: { assemblerId: 'a1' } }
        ]
    },
    {
        id: 't2',
        orderId: 'o2', // Malm Bed
        skillRequired: 'MEDIUM',
        requiredSkills: 'MEDIUM',
        status: 'IN_PROGRESS',
        scheduledStart: new Date(Date.now() - 1000 * 60 * 60), // Started 1 hour ago
        scheduledEnd: new Date(Date.now() + 1000 * 60 * 60),
        actualStart: new Date(Date.now() - 1000 * 60 * 60),
        assignedAssemblerIds: ['a2'], // Array
        createdAt: new Date(),
        estimatedDurationMinutes: 60,
        scheduledTime: new Date(Date.now() - 1000 * 60 * 60),
        history: [
            { id: 'e2', taskId: 't2', type: 'STARTED', eventTime: new Date(Date.now() - 3600000), location: { lat: -36.8600, lng: 174.7800, address: 'En Route Location' }, metadata: { assemblerId: 'a2' } }
        ]
    },
    {
        id: 't3',
        orderId: 'o3', // Billy Bookcase
        skillRequired: 'EASY',
        requiredSkills: 'EASY',
        status: 'ISSUE',
        scheduledStart: new Date(Date.now() - 1000 * 60 * 60 * 24), // Yesterday
        scheduledEnd: new Date(Date.now() - 1000 * 60 * 60 * 22),
        actualStart: new Date(Date.now() - 1000 * 60 * 60 * 24),
        assignedAssemblerIds: ['a3'], // Array
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        estimatedDurationMinutes: 45,
        scheduledTime: null,
        history: [
            { id: 'e3', taskId: 't3', type: 'ISSUE_REPORTED', eventTime: new Date(Date.now() - 1000 * 60 * 60 * 23), location: { lat: -36.7800, lng: 174.7700, address: 'Issue Location' }, metadata: { reason: 'Missing parts' } }
        ]
    },
    {
        id: 't4',
        orderId: 'o4',
        skillRequired: 'MEDIUM',
        requiredSkills: 'MEDIUM',
        status: 'OPEN',
        scheduledStart: new Date(Date.now() + 1000 * 60 * 60 * 24), // Tomorrow
        scheduledEnd: new Date(Date.now() + 1000 * 60 * 60 * 26),
        assignedAssemblerIds: [], // Empty array for unassigned
        createdAt: new Date(),
        estimatedDurationMinutes: 150,
        scheduledTime: null,
        history: []
    }
];

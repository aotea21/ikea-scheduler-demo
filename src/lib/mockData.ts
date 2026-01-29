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
        status: 'AVAILABLE',
        skills: ['EASY', 'MEDIUM', 'HARD'],
        rating: 5.0,
        ratingCount: 124,
        currentLocation: { lat: -36.8500, lng: 174.7600, address: '123 CBD Lane, Auckland' },
        availability: [],
        activeTaskId: null,
        isActive: true,
        lastSeenAt: new Date(),
        mobileNumberPrimary: '021 555 0001'
    },
    {
        id: 'a2',
        name: 'Sarah Connor',
        status: 'AVAILABLE',
        skills: ['EASY', 'MEDIUM'],
        rating: 4.8,
        ratingCount: 89,
        currentLocation: { lat: -36.8550, lng: 174.7450, address: '45 Freemans Bay Rd, Auckland' },
        availability: [],
        activeTaskId: null,
        isActive: true,
        lastSeenAt: new Date(),
        mobileNumberPrimary: '022 555 0002'
    },
    {
        id: 'a3',
        name: 'Mike Ross',
        status: 'AVAILABLE',
        skills: ['EASY'],
        rating: 3.5,
        ratingCount: 42,
        currentLocation: { lat: -36.7800, lng: 174.7700, address: '78 Milford Rd, North Shore' },
        availability: [],
        activeTaskId: null,
        isActive: false,
        lastSeenAt: new Date(Date.now() - 3600000), // 1 hour ago
        mobileNumberPrimary: '027 555 0003'
    },
    {
        id: 'a4',
        name: 'Jessica Pearson',
        status: 'AVAILABLE',
        skills: ['EASY', 'MEDIUM', 'HARD'],
        rating: 4.9,
        ratingCount: 210,
        currentLocation: { lat: -36.8600, lng: 174.7800, address: '12 Remuera Rd, Remuera' },
        availability: [],
        activeTaskId: null,
        isActive: true,
        lastSeenAt: new Date(),
        mobileNumberPrimary: '021 555 0004'
    },
    {
        id: 'a5',
        name: 'Louis Litt',
        status: 'AVAILABLE',
        skills: ['EASY', 'MEDIUM'],
        rating: 4.2,
        ratingCount: 15,
        currentLocation: { lat: -36.9000, lng: 174.8000, address: '34 Ellerslie Park, Ellerslie' },
        availability: [],
        activeTaskId: null,
        isActive: true,
        lastSeenAt: new Date(),
        mobileNumberPrimary: '022 555 0005'
    },
    {
        id: 'a6',
        name: 'Donna Paulsen',
        status: 'AVAILABLE',
        skills: ['EASY', 'MEDIUM', 'HARD'],
        rating: 5.0,
        ratingCount: 300,
        currentLocation: { lat: -36.8400, lng: 174.7500, address: '56 High St, Downtown' },
        availability: [],
        activeTaskId: null,
        isActive: true,
        lastSeenAt: new Date(),
        mobileNumberPrimary: '027 555 0006'
    },
    {
        id: 'a7',
        name: 'Rachel Green',
        status: 'AVAILABLE',
        skills: ['MEDIUM', 'HARD'],
        rating: 4.7,
        ratingCount: 156,
        currentLocation: { lat: -36.8900, lng: 174.7900, address: '90 Greenlane Rd, Greenlane' },
        availability: [],
        activeTaskId: null,
        isActive: true,
        lastSeenAt: new Date(),
        mobileNumberPrimary: '021 555 0007',
        mobileNumberSecondary: '09 555 0107'
    },
    {
        id: 'a8',
        name: 'Ross Geller',
        status: 'AVAILABLE',
        skills: ['EASY', 'MEDIUM', 'HARD'],
        rating: 4.4,
        ratingCount: 78,
        currentLocation: { lat: -36.7650, lng: 174.7550, address: '11 Takapuna Terrace, Takapuna' },
        availability: [],
        activeTaskId: null,
        isActive: true,
        lastSeenAt: new Date(),
        mobileNumberPrimary: '022 555 0008'
    },
    {
        id: 'a9',
        name: 'Monica Bing',
        status: 'AVAILABLE',
        skills: ['EASY', 'MEDIUM'],
        rating: 4.9,
        ratingCount: 201,
        currentLocation: { lat: -36.8650, lng: 174.8300, address: '22 St Heliers Bay Rd, St Heliers' },
        availability: [],
        activeTaskId: null,
        isActive: false,
        lastSeenAt: new Date(Date.now() - 7200000), // 2 hours ago
        mobileNumberPrimary: '027 555 0009'
    },
    {
        id: 'a10',
        name: 'Chandler Bing',
        status: 'AVAILABLE',
        skills: ['MEDIUM', 'HARD'],
        rating: 4.6,
        ratingCount: 134,
        currentLocation: { lat: -36.8100, lng: 174.7400, address: '33 Herne Bay Rd, Herne Bay' },
        availability: [],
        activeTaskId: null,
        isActive: true,
        lastSeenAt: new Date(),
        mobileNumberPrimary: '021 555 0010',
        mobileNumberSecondary: '09 555 0210'
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
    {
        id: 'o5',
        customerName: 'Ethan Hunt',
        address: LOCATIONS.TAKAPUNA,
        items: [
            { id: 'i5', name: 'MALM Bed Frame', sku: '333.444.55', quantity: 1 },
            { id: 'i6', name: 'HEMNES Nightstand', sku: '444.555.66', quantity: 2 }
        ],
        customerPhone: '021 999 1111',
        email: 'ethan.h@example.com',
        deliveryFrom: new Date(new Date().setHours(9, 30, 0)),
        deliveryTo: new Date(new Date().setHours(12, 0, 0)),
        deliveryDate: '2025-10-28',
        assemblyWindow: '09:30 - 12:00',
        estimatedTime: 135,
        serviceFee: 175.00,
        notes: 'Apartment building, elevator access.',
        status: 'DELIVERED',
        location: LOCATIONS.TAKAPUNA
    },
    {
        id: 'o6',
        customerName: 'Fiona Carter',
        address: LOCATIONS.PONSONBY,
        items: [
            { id: 'i7', name: 'EKTORP Sofa', sku: '789.012.34', quantity: 1 }
        ],
        customerPhone: '022 222 3333',
        email: 'fiona.c@example.com',
        deliveryFrom: new Date(new Date().setHours(13, 0, 0)),
        deliveryTo: new Date(new Date().setHours(16, 0, 0)),
        deliveryDate: '2025-10-28',
        assemblyWindow: '13:00 - 16:00',
        estimatedTime: 90,
        serviceFee: 120.00,
        status: 'DELIVERED',
        location: LOCATIONS.PONSONBY
    },
    {
        id: 'o7',
        customerName: 'George Wilson',
        address: Object.assign({}, LOCATIONS.NEWMARKET, { lat: -36.8700, lng: 174.7780, address: '15 Khyber Pass Rd, Newmarket' }),
        items: [
            { id: 'i8', name: 'ALEX Desk', sku: '234.567.89', quantity: 1 },
            { id: 'i9', name: 'MARKUS Office Chair', sku: '345.678.90', quantity: 1 }
        ],
        customerPhone: '027 444 5555',
        email: 'george.w@example.com',
        deliveryFrom: new Date(new Date().setHours(10, 0, 0)),
        deliveryTo: new Date(new Date().setHours(12, 0, 0)),
        deliveryDate: '2025-10-29',
        assemblyWindow: '10:00 - 12:00',
        estimatedTime: 75,
        serviceFee: 95.00,
        notes: 'Office space on 3rd floor.',
        status: 'DELIVERED',
        location: Object.assign({}, LOCATIONS.NEWMARKET, { lat: -36.8700, lng: 174.7780, address: '15 Khyber Pass Rd, Newmarket' })
    },
    {
        id: 'o8',
        customerName: 'Hannah Lee',
        address: Object.assign({}, LOCATIONS.WAREHOUSE, { lat: -36.8950, lng: 174.8200, address: '45 Mt Wellington Hwy' }),
        items: [
            { id: 'i10', name: 'BRIMNES Wardrobe', sku: '456.789.01', quantity: 1 }
        ],
        customerPhone: '021 666 7777',
        email: 'hannah.l@example.com',
        deliveryFrom: new Date(new Date().setHours(14, 0, 0)),
        deliveryTo: new Date(new Date().setHours(17, 0, 0)),
        deliveryDate: '2025-10-29',
        assemblyWindow: '14:00 - 17:00',
        estimatedTime: 110,
        serviceFee: 140.00,
        notes: 'Please park on street.',
        status: 'DELIVERED',
        location: Object.assign({}, LOCATIONS.WAREHOUSE, { lat: -36.8950, lng: 174.8200, address: '45 Mt Wellington Hwy' })
    },
    {
        id: 'o9',
        customerName: 'Ian Fraser',
        address: Object.assign({}, LOCATIONS.DOWNTOWN, { lat: -36.8470, lng: 174.7650, address: '88 Fort St, Auckland CBD' }),
        items: [
            { id: 'i11', name: 'LACK TV Unit', sku: '567.890.12', quantity: 1 },
            { id: 'i12', name: 'LACK Coffee Table', sku: '678.901.23', quantity: 1 }
        ],
        customerPhone: '022 888 9999',
        email: 'ian.f@example.com',
        deliveryFrom: new Date(new Date().setHours(11, 0, 0)),
        deliveryTo: new Date(new Date().setHours(13, 0, 0)),
        deliveryDate: '2025-10-30',
        assemblyWindow: '11:00 - 13:00',
        estimatedTime: 60,
        serviceFee: 80.00,
        status: 'DELIVERED',
        location: Object.assign({}, LOCATIONS.DOWNTOWN, { lat: -36.8470, lng: 174.7650, address: '88 Fort St, Auckland CBD' })
    },
    {
        id: 'o10',
        customerName: 'Julia Martinez',
        address: LOCATIONS.REMUERA,
        items: [
            { id: 'i13', name: 'BESTA Storage Combination', sku: '890.123.45', quantity: 1 }
        ],
        customerPhone: '027 111 2222',
        email: 'julia.m@example.com',
        deliveryFrom: new Date(new Date().setHours(15, 0, 0)),
        deliveryTo: new Date(new Date().setHours(18, 0, 0)),
        deliveryDate: '2025-10-30',
        assemblyWindow: '15:00 - 18:00',
        estimatedTime: 120,
        serviceFee: 155.00,
        notes: 'Have extension cord ready.',
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
            { id: 'e1', taskId: 't1', type: 'ASSIGNED', eventTime: new Date(Date.now() - 3600000), timestamp: new Date(Date.now() - 3600000), location: { lat: -36.8485, lng: 174.7633, address: 'Previous Location' }, metadata: { assemblerId: 'a1' } }
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
            { id: 'e2', taskId: 't2', type: 'STARTED', eventTime: new Date(Date.now() - 3600000), timestamp: new Date(Date.now() - 3600000), location: { lat: -36.8600, lng: 174.7800, address: 'En Route Location' }, metadata: { assemblerId: 'a2' } }
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
            { id: 'e3', taskId: 't3', type: 'ISSUE_REPORTED', eventTime: new Date(Date.now() - 1000 * 60 * 60 * 23), timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23), location: { lat: -36.7800, lng: 174.7700, address: 'Issue Location' }, metadata: { reason: 'Missing parts' } }
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
    },
    {
        id: 't5',
        orderId: 'o5',
        skillRequired: 'MEDIUM',
        requiredSkills: 'MEDIUM',
        status: 'ASSIGNED',
        scheduledStart: new Date(Date.now() + 1000 * 60 * 60 * 3), // In 3 hours
        scheduledEnd: new Date(Date.now() + 1000 * 60 * 60 * 5.25),
        assignedAssemblerIds: ['a7', 'a8'],
        createdAt: new Date(),
        estimatedDurationMinutes: 135,
        scheduledTime: new Date(Date.now() + 1000 * 60 * 60 * 3),
        history: [
            { id: 'e5', taskId: 't5', type: 'ASSIGNED', eventTime: new Date(Date.now() - 1800000), timestamp: new Date(Date.now() - 1800000), location: { lat: -36.7650, lng: 174.7550, address: 'Takapuna' }, metadata: { assemblerId: 'a7,a8' } }
        ]
    },
    {
        id: 't6',
        orderId: 'o6',
        skillRequired: 'MEDIUM',
        requiredSkills: 'MEDIUM',
        status: 'EN_ROUTE',
        scheduledStart: new Date(Date.now() + 1000 * 60 * 30), // In 30 mins
        scheduledEnd: new Date(Date.now() + 1000 * 60 * 120),
        assignedAssemblerIds: ['a10'],
        createdAt: new Date(),
        estimatedDurationMinutes: 90,
        scheduledTime: new Date(Date.now() + 1000 * 60 * 30),
        history: [
            { id: 'e6', taskId: 't6', type: 'ASSIGNED', eventTime: new Date(Date.now() - 3000000), timestamp: new Date(Date.now() - 3000000), location: { lat: -36.8100, lng: 174.7400, address: 'Herne Bay' }, metadata: { assemblerId: 'a10' } },
            { id: 'e7', taskId: 't6', type: 'EN_ROUTE', eventTime: new Date(Date.now() - 900000), timestamp: new Date(Date.now() - 900000), location: { lat: -36.8200, lng: 174.7450, address: 'En route' }, metadata: {} }
        ]
    },
    {
        id: 't7',
        orderId: 'o7',
        skillRequired: 'EASY',
        requiredSkills: 'EASY',
        status: 'COMPLETED',
        scheduledStart: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        scheduledEnd: new Date(Date.now() - 1000 * 60 * 60 * 3.75),
        actualStart: new Date(Date.now() - 1000 * 60 * 60 * 5),
        actualEnd: new Date(Date.now() - 1000 * 60 * 60 * 3.5),
        assignedAssemblerIds: ['a5'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10),
        estimatedDurationMinutes: 75,
        scheduledTime: new Date(Date.now() - 1000 * 60 * 60 * 5),
        history: [
            { id: 'e8', taskId: 't7', type: 'ASSIGNED', eventTime: new Date(Date.now() - 1000 * 60 * 60 * 6), timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), location: { lat: -36.9000, lng: 174.8000, address: 'Ellerslie' }, metadata: { assemblerId: 'a5' } },
            { id: 'e9', taskId: 't7', type: 'STARTED', eventTime: new Date(Date.now() - 1000 * 60 * 60 * 5), timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), location: { lat: -36.8700, lng: 174.7780, address: 'Newmarket' }, metadata: {} },
            { id: 'e10', taskId: 't7', type: 'COMPLETED', eventTime: new Date(Date.now() - 1000 * 60 * 60 * 3.5), timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.5), location: { lat: -36.8700, lng: 174.7780, address: 'Newmarket' }, metadata: {} }
        ]
    },
    {
        id: 't8',
        orderId: 'o8',
        skillRequired: 'MEDIUM',
        requiredSkills: 'MEDIUM',
        status: 'OPEN',
        scheduledStart: new Date(Date.now() + 1000 * 60 * 60 * 48), // In 2 days
        scheduledEnd: new Date(Date.now() + 1000 * 60 * 60 * 49.83),
        assignedAssemblerIds: [],
        createdAt: new Date(),
        estimatedDurationMinutes: 110,
        scheduledTime: null,
        history: []
    },
    {
        id: 't9',
        orderId: 'o9',
        skillRequired: 'EASY',
        requiredSkills: 'EASY',
        status: 'ASSIGNED',
        scheduledStart: new Date(Date.now() + 1000 * 60 * 60 * 6), // In 6 hours
        scheduledEnd: new Date(Date.now() + 1000 * 60 * 60 * 7),
        assignedAssemblerIds: ['a4'],
        createdAt: new Date(),
        estimatedDurationMinutes: 60,
        scheduledTime: new Date(Date.now() + 1000 * 60 * 60 * 6),
        history: [
            { id: 'e11', taskId: 't9', type: 'ASSIGNED', eventTime: new Date(Date.now() - 1200000), timestamp: new Date(Date.now() - 1200000), location: { lat: -36.8600, lng: 174.7800, address: 'Remuera' }, metadata: { assemblerId: 'a4' } }
        ]
    },
    {
        id: 't10',
        orderId: 'o10',
        skillRequired: 'HARD',
        requiredSkills: 'HARD',
        status: 'OPEN',
        scheduledStart: new Date(Date.now() + 1000 * 60 * 60 * 72), // In 3 days
        scheduledEnd: new Date(Date.now() + 1000 * 60 * 60 * 74),
        assignedAssemblerIds: [],
        createdAt: new Date(),
        estimatedDurationMinutes: 120,
        scheduledTime: null,
        history: []
    }
];

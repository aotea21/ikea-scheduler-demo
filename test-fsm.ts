/**
 * Simple test file to verify Assembler Status FSM logic
 * Run this with: npx tsx test-fsm.ts
 */

import {
    canTransition,
    validateTransition,
    getValidNextStatuses,
    canAssignTask,
    requiresActiveTask,
    validateTaskAssignment,
    STATUS_TRANSITIONS
} from './src/lib/assembler-fsm';
import type { AssemblerStatus } from './src/lib/types';

console.log('🧪 Testing Assembler Status FSM\n');

// Test 1: Valid Transitions
console.log('✅ Test 1: Valid Transitions');
console.log('  AVAILABLE → ASSIGNED:', canTransition('AVAILABLE', 'ASSIGNED')); // true
console.log('  ASSIGNED → EN_ROUTE:', canTransition('ASSIGNED', 'EN_ROUTE')); // true
console.log('  ASSIGNED → AVAILABLE:', canTransition('ASSIGNED', 'AVAILABLE')); // true (cancel)
console.log('  EN_ROUTE → WORKING:', canTransition('EN_ROUTE', 'WORKING')); // true
console.log('  EN_ROUTE → AVAILABLE:', canTransition('EN_ROUTE', 'AVAILABLE')); // true (cancel)
console.log('  WORKING → AVAILABLE:', canTransition('WORKING', 'AVAILABLE')); // true
console.log('');

// Test 2: Invalid Transitions
console.log('❌ Test 2: Invalid Transitions (should all be false)');
console.log('  AVAILABLE → WORKING:', canTransition('AVAILABLE', 'WORKING')); // false
console.log('  AVAILABLE → EN_ROUTE:', canTransition('AVAILABLE', 'EN_ROUTE')); // false
console.log('  ASSIGNED → WORKING:', canTransition('ASSIGNED', 'WORKING')); // false
console.log('  WORKING → ASSIGNED:', canTransition('WORKING', 'ASSIGNED')); // false
console.log('  WORKING → EN_ROUTE:', canTransition('WORKING', 'EN_ROUTE')); // false
console.log('');

// Test 3: Get Valid Next Statuses
console.log('📋 Test 3: Get Valid Next Statuses');
const statuses: AssemblerStatus[] = ['AVAILABLE', 'ASSIGNED', 'EN_ROUTE', 'WORKING'];
statuses.forEach(status => {
    console.log(`  ${status} →`, getValidNextStatuses(status).join(', '));
});
console.log('');

// Test 4: Validate Transition with Exceptions
console.log('🛡️  Test 4: Validate Transition (with exceptions)');
try {
    validateTransition('AVAILABLE', 'ASSIGNED', 'a1');
    console.log('  ✅ AVAILABLE → ASSIGNED: Valid');
} catch (e) {
    console.log('  ❌ Error:', (e as Error).message);
}

try {
    validateTransition('AVAILABLE', 'WORKING', 'a1');
    console.log('  ❌ Should have thrown error!');
} catch (e) {
    console.log('  ✅ AVAILABLE → WORKING: Correctly rejected -', (e as Error).message);
}
console.log('');

// Test 5: Can Assign Task
console.log('🎯 Test 5: Can Assign Task');
console.log('  AVAILABLE:', canAssignTask('AVAILABLE')); // true
console.log('  ASSIGNED:', canAssignTask('ASSIGNED')); // false
console.log('  EN_ROUTE:', canAssignTask('EN_ROUTE')); // false
console.log('  WORKING:', canAssignTask('WORKING')); // false
console.log('');

// Test 6: Requires Active Task
console.log('📌 Test 6: Requires Active Task');
console.log('  AVAILABLE:', requiresActiveTask('AVAILABLE')); // false
console.log('  ASSIGNED:', requiresActiveTask('ASSIGNED')); // true
console.log('  EN_ROUTE:', requiresActiveTask('EN_ROUTE')); // true
console.log('  WORKING:', requiresActiveTask('WORKING')); // true
console.log('');

// Test 7: Validate Task Assignment
console.log('🔍 Test 7: Validate Task Assignment');
try {
    validateTaskAssignment('AVAILABLE', null);
    console.log('  ✅ AVAILABLE with no task: Valid');
} catch (e) {
    console.log('  ❌ Error:', (e as Error).message);
}

try {
    validateTaskAssignment('ASSIGNED', 't1');
    console.log('  ✅ ASSIGNED with task: Valid');
} catch (e) {
    console.log('  ❌ Error:', (e as Error).message);
}

try {
    validateTaskAssignment('AVAILABLE', 't1');
    console.log('  ❌ Should have thrown error!');
} catch (e) {
    console.log('  ✅ AVAILABLE with task: Correctly rejected -', (e as Error).message);
}

try {
    validateTaskAssignment('ASSIGNED', null);
    console.log('  ❌ Should have thrown error!');
} catch (e) {
    console.log('  ✅ ASSIGNED without task: Correctly rejected -', (e as Error).message);
}
console.log('');

// Test 8: Full Transition Map
console.log('📊 Test 8: Complete FSM Transition Map');
console.log(JSON.stringify(STATUS_TRANSITIONS, null, 2));
console.log('');

console.log('✨ All FSM tests completed!');

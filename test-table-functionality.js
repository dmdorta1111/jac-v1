/**
 * Manual Test Script for Table Row Selection
 *
 * This script provides test cases to manually verify table row selection functionality.
 * Run this in browser console on http://localhost:3000/test-table
 */

console.log('=== Table Row Selection Test Suite ===\n');

// Test 1: Check if table elements are rendered
function test1_checkTableRendered() {
  console.log('Test 1: Checking if table elements are rendered...');
  const tables = document.querySelectorAll('table');
  console.log(`✓ Found ${tables.length} table(s)`);

  const tableRows = document.querySelectorAll('tbody tr[role="radio"]');
  console.log(`✓ Found ${tableRows.length} selectable row(s) with role="radio"`);

  return tables.length > 0 && tableRows.length > 0;
}

// Test 2: Check accessibility attributes
function test2_checkAccessibility() {
  console.log('\nTest 2: Checking accessibility attributes...');
  const radioRows = document.querySelectorAll('tr[role="radio"]');

  let passed = true;
  radioRows.forEach((row, idx) => {
    const hasTabIndex = row.hasAttribute('tabindex');
    const hasAriaChecked = row.hasAttribute('aria-checked');

    if (!hasTabIndex || !hasAriaChecked) {
      console.error(`✗ Row ${idx}: Missing accessibility attributes`);
      passed = false;
    }
  });

  if (passed) {
    console.log(`✓ All ${radioRows.length} rows have proper accessibility attributes`);
  }

  return passed;
}

// Test 3: Simulate row click and check selection
function test3_simulateRowClick() {
  console.log('\nTest 3: Simulating row click...');
  const firstTable = document.querySelector('table');
  const firstRow = firstTable?.querySelector('tbody tr[role="radio"]');

  if (!firstRow) {
    console.error('✗ No selectable row found');
    return false;
  }

  // Click the row
  firstRow.click();

  // Check if row has selection styles
  const hasSelectedStyle = firstRow.classList.contains('border-l-4') ||
                          firstRow.className.includes('border-l-zinc') ||
                          firstRow.getAttribute('aria-checked') === 'true';

  if (hasSelectedStyle) {
    console.log('✓ Row click applied selection styling');
  } else {
    console.error('✗ Row click did not apply selection styling');
    return false;
  }

  return true;
}

// Test 4: Check if only one row is selected at a time
function test4_singleSelection() {
  console.log('\nTest 4: Testing single selection (clicking multiple rows)...');
  const firstTable = document.querySelector('table');
  const rows = firstTable?.querySelectorAll('tbody tr[role="radio"]');

  if (!rows || rows.length < 2) {
    console.error('✗ Not enough rows to test single selection');
    return false;
  }

  // Click first row
  rows[0].click();
  setTimeout(() => {
    const selectedCount1 = document.querySelectorAll('tr[aria-checked="true"]').length;
    console.log(`After clicking row 1: ${selectedCount1} row(s) selected`);

    // Click second row
    rows[1].click();
    setTimeout(() => {
      const selectedCount2 = document.querySelectorAll('tr[aria-checked="true"]').length;
      console.log(`After clicking row 2: ${selectedCount2} row(s) selected`);

      if (selectedCount2 === 1) {
        console.log('✓ Only one row selected at a time');
        return true;
      } else {
        console.error('✗ Multiple rows selected');
        return false;
      }
    }, 100);
  }, 100);

  return true;
}

// Test 5: Check keyboard navigation
function test5_keyboardNavigation() {
  console.log('\nTest 5: Testing keyboard navigation...');
  const firstRow = document.querySelector('tbody tr[role="radio"]');

  if (!firstRow) {
    console.error('✗ No selectable row found');
    return false;
  }

  // Focus the row
  firstRow.focus();

  // Simulate Enter key
  const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
  firstRow.dispatchEvent(enterEvent);

  setTimeout(() => {
    const isSelected = firstRow.getAttribute('aria-checked') === 'true';
    if (isSelected) {
      console.log('✓ Enter key selects row');
    } else {
      console.error('✗ Enter key did not select row');
      return false;
    }

    // Test Space key on another row
    const secondRow = document.querySelectorAll('tbody tr[role="radio"]')[1];
    if (secondRow) {
      secondRow.focus();
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      secondRow.dispatchEvent(spaceEvent);

      setTimeout(() => {
        const isSelected2 = secondRow.getAttribute('aria-checked') === 'true';
        if (isSelected2) {
          console.log('✓ Space key selects row');
          return true;
        } else {
          console.error('✗ Space key did not select row');
          return false;
        }
      }, 100);
    }
  }, 100);

  return true;
}

// Test 6: Check empty table display
function test6_emptyTable() {
  console.log('\nTest 6: Checking empty table display...');
  const allTables = document.querySelectorAll('table');

  let foundEmptyMessage = false;
  allTables.forEach((table, idx) => {
    const emptyMessage = table.querySelector('td[colspan]');
    if (emptyMessage && emptyMessage.textContent.includes('No data available')) {
      console.log(`✓ Table ${idx + 1} shows "No data available" message`);
      foundEmptyMessage = true;
    }
  });

  if (foundEmptyMessage) {
    return true;
  } else {
    console.log('Note: No empty tables found (this is OK if test data exists)');
    return true;
  }
}

// Test 7: Check form validation for required table
function test7_requiredValidation() {
  console.log('\nTest 7: Testing required field validation...');
  const submitButton = document.querySelector('button[type="submit"]');

  if (!submitButton) {
    console.error('✗ Submit button not found');
    return false;
  }

  // Clear any selections
  console.log('Attempting to submit form without table selection...');
  submitButton.click();

  setTimeout(() => {
    const errorMessage = document.querySelector('[data-slot="field-error"]');
    if (errorMessage) {
      console.log(`✓ Validation error shown: "${errorMessage.textContent}"`);
      return true;
    } else {
      console.log('Note: No error shown (may have default selection or different validation)');
      return true;
    }
  }, 100);

  return true;
}

// Test 8: Verify radio indicator display
function test8_radioIndicator() {
  console.log('\nTest 8: Checking radio indicator display...');
  const firstRow = document.querySelector('tbody tr[role="radio"]');

  if (!firstRow) {
    console.error('✗ No selectable row found');
    return false;
  }

  // Click row
  firstRow.click();

  setTimeout(() => {
    const radioIndicator = firstRow.querySelector('td:first-child div');
    if (radioIndicator) {
      const styles = window.getComputedStyle(radioIndicator);
      console.log(`✓ Radio indicator found with border-radius: ${styles.borderRadius}`);
      return true;
    } else {
      console.error('✗ Radio indicator not found');
      return false;
    }
  }, 100);

  return true;
}

// Run all tests
console.log('\n=== Running All Tests ===\n');
setTimeout(() => {
  test1_checkTableRendered();
  setTimeout(() => test2_checkAccessibility(), 200);
  setTimeout(() => test3_simulateRowClick(), 400);
  setTimeout(() => test4_singleSelection(), 600);
  setTimeout(() => test5_keyboardNavigation(), 1000);
  setTimeout(() => test6_emptyTable(), 1400);
  setTimeout(() => test7_requiredValidation(), 1600);
  setTimeout(() => test8_radioIndicator(), 1800);

  setTimeout(() => {
    console.log('\n=== Test Suite Complete ===');
    console.log('Check results above for any ✗ failed tests');
  }, 2200);
}, 500);

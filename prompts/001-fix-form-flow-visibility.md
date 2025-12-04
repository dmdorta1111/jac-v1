<objective>
Investigate and fix a critical issue where user-entered form values are not properly accessible for driving conditional field visibility and form flow navigation in the dynamic form system.

The problem: User input values entered into DynamicFormRenderer are not being properly accessed/utilized by the form flow engine, causing conditional field visibility and dynamic form presentation to fail.
</objective>

<context>
This is a Next.js/React application with a sophisticated dynamic form system consisting of:

**Form Templates** (`public/form-templates/*.json`):
- JSON files containing form field definitions for creating projects and items
- Define field types, labels, validation, and conditional visibility rules

**Form Flows** (`public/form-flows/SDI-form-flow.json`):
- Instructions defining how forms and fields are presented to users
- Controls which forms appear based on user choices about items being created
- Uses conditional expressions to determine form navigation

**Core Libraries**:
- `lib/flow-engine/` - Flow execution and condition evaluation engine
  - `executor.ts` - Manages flow state and conditional navigation
  - `evaluator.ts` - Safe expression evaluation for flow conditions
  - `loader.ts` - Loads flow definitions

- `lib/form-templates/` - Form template loading and management
  - `loader.ts` - Loads form templates from JSON files

**DynamicFormRenderer** (`components/DynamicFormRenderer.tsx`):
- Renders forms dynamically based on templates
- Manages form state (`formData`)
- Has conditional field visibility logic (`checkConditional`)
- Syncs form data to parent via `onFormDataChange` callback

The issue is that even though users are entering values into the forms, these values are not being properly passed to or accessible by the flow engine, preventing:
1. Conditional fields from showing/hiding correctly
2. Form flow navigation from working properly
3. The next appropriate form from being determined based on user input
</context>

<requirements>
1. **Trace the data flow** from user input to conditional evaluation:
   - How does DynamicFormRenderer capture user input?
   - How is formData synced to parent components?
   - How does FlowExecutor receive and use form data for conditions?
   - Where is the disconnect happening?

2. **Examine the integration points**:
   - Check how DynamicFormRenderer's `onFormDataChange` callback is used
   - Verify how `FlowExecutor.updateState()` receives form data
   - Ensure flow state is properly passed when evaluating conditions
   - Check if there's a timing issue (async/sync mismatch)

3. **Review condition evaluation logic**:
   - Verify `checkConditional` in DynamicFormRenderer uses current formData
   - Check if `evaluateCondition` in FlowExecutor has access to latest state
   - Ensure variable names match between form fields and conditions
   - Validate type conversions (boolean vs number, string vs number)

4. **Find the root cause**:
   - Is formData being captured but not propagated?
   - Is the flow state being updated but not used for evaluation?
   - Are there naming mismatches between form fields and condition variables?
   - Is there a React state synchronization issue?
</requirements>

<investigation_steps>
1. **Read the component that uses DynamicFormRenderer** to see how it handles:
   - The `onFormDataChange` callback implementation
   - How form data is passed to FlowExecutor
   - When `updateState()` is called on the executor

2. **Search for FlowExecutor usage** in the codebase:
   ```
   Use Grep to find where FlowExecutor is instantiated and used
   Pattern: "FlowExecutor|updateState|evaluateCondition"
   ```

3. **Check the form flow JSON** to understand:
   - How conditions are structured
   - What variable names are expected
   - How they should match form field names

4. **Add strategic console.log statements** (or examine existing ones) at:
   - DynamicFormRenderer when formData changes
   - Parent component when receiving onFormDataChange
   - FlowExecutor.updateState when state is updated
   - Evaluator when conditions are evaluated

5. **Compare variable names** between:
   - Form template field names (e.g., `OPENING_TYPE`)
   - Flow condition expressions (e.g., `OPENING_TYPE == 1`)
   - Actual keys in formData object
</investigation_steps>

<implementation>
Once the root cause is identified, implement the fix:

1. **If data propagation issue**:
   - Ensure `onFormDataChange` is called correctly
   - Fix parent component to properly call `updateState`
   - Add missing data synchronization points

2. **If naming mismatch issue**:
   - Standardize field names across templates and flows
   - Add name mapping if necessary
   - Update condition expressions to match field names

3. **If state timing issue**:
   - Fix React state updates to be synchronous where needed
   - Use proper useEffect dependencies
   - Ensure state is updated before condition evaluation

4. **If type conversion issue**:
   - Ensure consistent type handling (normalize to numbers if needed)
   - Fix boolean/number conversion in both directions
   - Update `normalizeValue` function if necessary
</implementation>

<verification>
After implementing the fix, verify:

1. **Manual testing**:
   - Open a form with conditional fields
   - Enter values that should trigger field visibility changes
   - Confirm fields show/hide correctly
   - Complete a form and verify next form is determined correctly

2. **Console verification**:
   - Check that formData contains expected values
   - Verify FlowExecutor state matches formData
   - Confirm condition evaluation receives correct variables
   - Ensure debug logs show proper data flow

3. **Test multiple scenarios**:
   - Test AND conditions (multiple fields must match)
   - Test OR conditions (any field can match)
   - Test numeric conditions (equals, greater than, less than)
   - Test boolean/switch conditions (true/false vs 1/0)
</verification>

<output>
Provide a detailed report including:

1. **Root cause analysis**:
   - Exact location of the bug
   - Why it's happening
   - What data is missing or incorrect

2. **Code changes made**:
   - Files modified
   - Specific changes with before/after
   - Explanation of why each change fixes the issue

3. **Testing results**:
   - What scenarios were tested
   - Confirmation that conditional visibility now works
   - Confirmation that form flow navigation works

4. **Any remaining concerns or edge cases** to be aware of
</output>

<success_criteria>
- User-entered values are correctly captured in formData
- formData is properly propagated to FlowExecutor state
- Conditional field visibility responds to user input
- Form flow navigation uses current state to determine next form
- No console errors related to undefined variables or evaluation failures
- Debug logs show data flowing correctly through the system
</success_criteria>

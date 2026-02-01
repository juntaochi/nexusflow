
## Layout Implementation
- Implemented `AppShell` with conditional layout for Landing vs Dashboard.
- Used `sticky` positioning for `TopBar` in Dashboard layout, requiring less top padding (`pt-6`) than the requested `pt-20` (which assumes fixed header).
- Added hamburger menu button to `TopBar` for mobile and implemented mobile sidebar interaction with backdrop and transitions.
- `Sidebar` now accepts `isOpen` and `onClose` props for mobile control.

## Delegation Panel Refactor
- Refactored `DelegationPanel` to use `DataTable` for better data presentation.
- Implemented a custom Security Sandbox Widget with visual gauge using `framer-motion` and conditional styling based on usage percentage.
- Used `viem`'s `formatUnits` for handling token values.
- Mocked session key data as the hook doesn't provide it yet, but set up the structure for easy integration.

## Dashboard Refactor
- Refactored Dashboard to feature "Real Profit" ticker.
- Used `lucide-react` for consistent iconography.
- Preserved 3D background and existing hooks while updating the UI structure.
- Removed unused `framer-motion` import to keep code clean.

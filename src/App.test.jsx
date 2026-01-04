import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PropertySearchApp from './App';
import propertiesData from '../public/properties.json';

describe('PropertySearchApp Component', () => {

    // Test 1: Property Type Filter
    test('should filter properties by type (House/Flat)', () => {
        render(<PropertySearchApp />);

        const totalProperties = propertiesData.properties.length;
        const houseCount = propertiesData.properties.filter(p => p.type === 'House').length;

        // Initially, all properties should be displayed
        expect(screen.getByText(`${totalProperties} Properties Found`)).toBeInTheDocument();

        // Select "House" from the dropdown
        const typeSelect = screen.getByLabelText('Property Type');
        fireEvent.change(typeSelect, { target: { value: 'House' } });

        // Click search button
        const searchButton = screen.getByText('Search Properties');
        fireEvent.click(searchButton);

        // Should now show only houses
        expect(screen.getByText(`${houseCount} ${houseCount === 1 ? 'Property' : 'Properties'} Found`)).toBeInTheDocument();
    });

    // Test 2: Bedroom Range Filter
    test('should filter properties by bedroom count', () => {
        render(<PropertySearchApp />);

        // Set minimum bedrooms to 3
        const minBedroomsInput = screen.getByLabelText('Minimum Bedrooms');
        fireEvent.change(minBedroomsInput, { target: { value: '3' } });

        // Set maximum bedrooms to 3
        const maxBedroomsInput = screen.getByLabelText('Maximum Bedrooms');
        fireEvent.change(maxBedroomsInput, { target: { value: '3' } });

        // Click search
        const searchButton = screen.getByText('Search Properties');
        fireEvent.click(searchButton);

        // Count properties with exactly 3 bedrooms from actual data
        const threeBedCount = propertiesData.properties.filter(p => p.bedrooms === 3).length;

        // Should show only the 3-bedroom properties
        expect(screen.getByText(`${threeBedCount} ${threeBedCount === 1 ? 'Property' : 'Properties'} Found`)).toBeInTheDocument();
    });

    // Test 3: Add to Favourites Functionality
    test('should add property to favourites when star button is clicked', () => {
        render(<PropertySearchApp />);

        const firstProperty = propertiesData.properties[0];

        // Find all "Add to favourites" buttons
        const favouriteButtons = screen.getAllByLabelText(/Add to favourites/i);

        // Click the first property's favourite button
        fireEvent.click(favouriteButtons[0]);

        // Check that the property appears in the favourites sidebar
        const sidebar = screen.getByLabelText('Saved Properties');
        expect(sidebar).toHaveTextContent(firstProperty.location);

        // The button should now be disabled and show "Already in favourites"
        expect(screen.getByLabelText('Already in favourites')).toBeInTheDocument();
    });

    // Test 4: Remove from Favourites Functionality
    test('should remove property from favourites when X button is clicked', () => {
        render(<PropertySearchApp />);

        const firstProperty = propertiesData.properties[0];

        // Add a property to favourites first
        const favouriteButtons = screen.getAllByLabelText(/Add to favourites/i);
        fireEvent.click(favouriteButtons[0]);

        // Verify it's in favourites
        const sidebar = screen.getByLabelText('Saved Properties');
        expect(sidebar).toHaveTextContent(firstProperty.location);

        // Find and click the remove button in the favourites sidebar
        const removeButton = screen.getByLabelText(/Remove .* from favourites/i);
        fireEvent.click(removeButton);

        // Property should no longer be in favourites
        expect(sidebar).toHaveTextContent('No saved properties yet');
    });

    // Test 5: Reset Search Functionality
    test('should reset all search filters and show all properties', () => {
        render(<PropertySearchApp />);

        const totalProperties = propertiesData.properties.length;

        // Apply some filters
        const typeSelect = screen.getByLabelText('Property Type');
        fireEvent.change(typeSelect, { target: { value: 'Flat' } });

        const minBedroomsInput = screen.getByLabelText('Minimum Bedrooms');
        fireEvent.change(minBedroomsInput, { target: { value: '2' } });

        const postcodeInput = screen.getByLabelText('Postcode Area');
        fireEvent.change(postcodeInput, { target: { value: 'BR6' } });

        // Click search
        const searchButton = screen.getByText('Search Properties');
        fireEvent.click(searchButton);

        // Click reset button
        const resetButton = screen.getByText('Reset');
        fireEvent.click(resetButton);

        // All filters should be cleared (check actual values, empty string for inputs)
        expect(typeSelect.value).toBe('');
        expect(minBedroomsInput.value).toBe('');
        expect(postcodeInput.value).toBe('');

        // Should show all properties again
        expect(screen.getByText(`${totalProperties} Properties Found`)).toBeInTheDocument();
    });

});
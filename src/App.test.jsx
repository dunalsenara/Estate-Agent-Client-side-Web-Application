import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PropertySearchApp from './App';

// Mock the properties data
jest.mock('../public/properties.json', () => ({
    properties: [
        {
            id: "prop1",
            type: "House",
            bedrooms: 3,
            price: "Rs.23,600,000",
            tenure: "Freehold",
            description: "Modern three-bedroom house with pool",
            longDescription: "A super-luxury two-storey residence",
            location: "Dehiwala-Mount Lavinia",
            locationpath: "RVJJ+22W Dehiwala-Mount Lavinia",
            postcode: "BR5",
            picture: "public/web images/pro1.1.jpeg",
            images: ["public/web images/pro1.1.jpeg"],
            floorPlan: "public/web images/pro1.6.png",
            added: { month: "October", day: 20, year: 2025 }
        },
        {
            id: "prop2",
            type: "Flat",
            bedrooms: 2,
            price: "Rs. 158,000,000",
            tenure: "Freehold",
            description: "Modern apartment at Cinnamon Life",
            longDescription: "Experience upscale city living",
            location: "Colombo 2",
            locationpath: "WV93+XJC Colombo",
            postcode: "BR6",
            picture: "public/web images/pro2.1.jpeg",
            images: ["public/web images/pro2.1.jpeg"],
            floorPlan: "public/web images/pro2.2.jpeg",
            added: { month: "September", day: 14, year: 2025 }
        },
        {
            id: "prop3",
            type: "House",
            bedrooms: 4,
            price: "Rs. 31,185,000",
            tenure: "Freehold",
            description: "Luxury 4-bedroom home",
            longDescription: "Ultra-modern luxury house",
            location: "Dehiwala",
            locationpath: "RVJJ+22W Dehiwala",
            postcode: "BR2",
            picture: "public/web images/pro6.1.jpeg",
            images: ["public/web images/pro6.1.jpeg"],
            floorPlan: "public/web images/pro6.4.jpeg",
            added: { month: "January", day: 20, year: 2025 }
        }
    ]
}));

describe('PropertySearchApp Component', () => {

    // Test 1: Property Type Filter
    test('should filter properties by type (House/Flat)', () => {
        render(<PropertySearchApp />);

        // Initially, all 3 properties should be displayed
        expect(screen.getByText('3 Properties Found')).toBeInTheDocument();

        // Select "House" from the dropdown
        const typeSelect = screen.getByLabelText('Property Type');
        fireEvent.change(typeSelect, { target: { value: 'House' } });

        // Click search button
        const searchButton = screen.getByText('Search Properties');
        fireEvent.click(searchButton);

        // Should now show only 2 houses
        expect(screen.getByText('2 Properties Found')).toBeInTheDocument();
        expect(screen.getByText('Dehiwala-Mount Lavinia')).toBeInTheDocument();
        expect(screen.getByText('Dehiwala')).toBeInTheDocument();
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

        // Should show only the 3-bedroom property
        expect(screen.getByText('1 Property Found')).toBeInTheDocument();
        expect(screen.getByText('Dehiwala-Mount Lavinia')).toBeInTheDocument();
    });

    // Test 3: Add to Favourites Functionality
    test('should add property to favourites when star button is clicked', () => {
        render(<PropertySearchApp />);

        // Find all "Add to favourites" buttons
        const favouriteButtons = screen.getAllByLabelText(/Add to favourites/i);

        // Click the first property's favourite button
        fireEvent.click(favouriteButtons[0]);

        // Check that the property appears in the favourites sidebar
        const sidebar = screen.getByLabelText('Saved Properties');
        expect(sidebar).toHaveTextContent('Dehiwala-Mount Lavinia');

        // The button should now be disabled and show "Already in favourites"
        expect(screen.getByLabelText('Already in favourites')).toBeInTheDocument();
    });

    // Test 4: Remove from Favourites Functionality
    test('should remove property from favourites when X button is clicked', () => {
        render(<PropertySearchApp />);

        // Add a property to favourites first
        const favouriteButtons = screen.getAllByLabelText(/Add to favourites/i);
        fireEvent.click(favouriteButtons[0]);

        // Verify it's in favourites
        const sidebar = screen.getByLabelText('Saved Properties');
        expect(sidebar).toHaveTextContent('Dehiwala-Mount Lavinia');

        // Find and click the remove button in the favourites sidebar
        const removeButton = screen.getByLabelText(/Remove .* from favourites/i);
        fireEvent.click(removeButton);

        // Property should no longer be in favourites
        expect(sidebar).toHaveTextContent('No saved properties yet');
    });

    // Test 5: Reset Search Functionality
    test('should reset all search filters and show all properties', () => {
        render(<PropertySearchApp />);

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

        // Should show filtered results (1 flat)
        expect(screen.getByText('1 Property Found')).toBeInTheDocument();

        // Click reset button
        const resetButton = screen.getByText('Reset');
        fireEvent.click(resetButton);

        // All filters should be cleared (check actual values, empty string for inputs)
        expect(typeSelect.value).toBe('');
        expect(minBedroomsInput.value).toBe('');
        expect(postcodeInput.value).toBe('');

        // Should show all 3 properties again
        expect(screen.getByText('3 Properties Found')).toBeInTheDocument();
    });

});
async function test() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/fields/73', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Field 2',
                field_type_id: 4, // textbox
                instructions: 'Test instructions',
                required: '1',
                module_values: '0',
                options: ''
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

test();

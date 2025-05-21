/**
 * FormData Handler for n8n
 * 
 * This code block handles FormData requests from the GutenVibes chat widget,
 * extracting both the JSON data and file uploads.
 */

// Function to handle FormData requests
function handleFormData($input) {
  try {
    // Get the request body
    const req = $input.first();
    
    // Check if this is a FormData request (has files)
    if (req.body && req.body.files && Array.isArray(req.body.files)) {
      console.log('Processing FormData request with files');
      
      // Parse the stringified message
      let message;
      try {
        message = JSON.parse(req.body.message);
      } catch (e) {
        console.log('Error parsing message JSON:', e.message);
        message = req.body.message; // Use as is if parsing fails
      }
      
      // Parse the stringified files array
      let filesMetadata;
      try {
        filesMetadata = JSON.parse(req.body.files);
      } catch (e) {
        console.log('Error parsing files JSON:', e.message);
        filesMetadata = []; // Use empty array if parsing fails
      }
      
      // Create a properly structured payload
      const payload = {
        route: req.body.route,
        message: message,
        session: req.body.session,
        files: filesMetadata,
        // Add the actual file data from the request
        fileData: req.body['files[]'] || []
      };
      
      // Return the structured payload
      return {
        json: payload
      };
    }
    
    // If not a FormData request, return the input as is
    return $input.all();
  } catch (error) {
    console.log('Error processing FormData:', error.message);
    return $input.all();
  }
}

// Export the function
module.exports = handleFormData;

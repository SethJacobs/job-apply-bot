# Universal Form Filler Extension

A Chrome extension that automatically fills any form with your saved information, including resume uploads and comprehensive personal data. **No backend required** - everything works locally in your browser.

---

## ✨ Features

* **Complete Local Storage**: No backend required - all data stored locally in your browser
* **Universal Form Filling**: Works on any website with form fields
* **Resume Upload Support**: Store and automatically upload your resume files
* **Comprehensive Data Management**: Store personal info, work experience, education, skills, and more
* **Multiple Profiles**: Create different profiles for different purposes (work, personal, etc.)
* **Smart Field Detection**: Automatically detects and fills various form field types
* **Drag & Drop Resume Upload**: Easy file management for your documents

---

## 🧱 Architecture

```
[ Browser Extension ] ──▶ Chrome Local Storage
                            ├── Profile Data (JSON)
                            ├── Resume Files (Base64)
                            └── Settings & Preferences

No external services required!
```

---

## 🚀 Quick Start

1. **Load the extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `extension` folder
2. **Set up your profile**:
   - Click the extension icon and select "Settings"
   - Fill out your information and upload your resume
   - Save your profile
3. **Start filling forms**:
   - Navigate to any form
   - Click the extension icon, select your profile, and click "Fill Current Form"

---

## 📋 What Information Can Be Stored

### Personal Information
- First/Last Name, Full Name
- Email, Phone Number
- Date of Birth
- Complete Address (Street, City, State, ZIP, Country)

### Professional Information
- LinkedIn, GitHub, Portfolio, and Personal Website URLs
- Work Experience (Company, Position, Dates, Description)
- Education (Institution, Degree, Field of Study, Graduation Year)
- Skills (comma-separated list)

### Documents
- Resume files (PDF, DOC, DOCX)
- Cover letter templates

### Emergency Contact
- Contact Name, Phone, Email
- Relationship to you

---

## 🧪 Using the Extension

### Setting Up Your Profile
1. Click the extension icon in your Chrome toolbar
2. Click "Settings" to open the options page
3. Fill out the comprehensive form with your information:
   - **Profile Information**: Give your profile a name
   - **Personal Information**: Basic contact details
   - **Address Information**: Complete address
   - **Resume & Documents**: Upload your resume and add cover letter template
   - **Professional Links**: LinkedIn, GitHub, portfolio URLs
   - **Work Experience**: Add multiple work experiences
   - **Education**: Add your educational background
   - **Skills**: List your skills (comma-separated)
   - **Emergency Contact**: Emergency contact information
4. Click "Save Profile"

### Filling Forms
1. Navigate to any website with a form (job applications, contact forms, etc.)
2. Click the extension icon
3. Select your profile from the dropdown
4. Click "Fill Current Form"
5. The extension will automatically detect and fill matching fields
6. Review the filled information and submit the form

### Managing Multiple Profiles
- Create different profiles for different contexts (e.g., "Job Applications", "Personal Forms")
- Switch between profiles easily from the popup
- Edit existing profiles by selecting them and clicking "Settings"
- Delete profiles you no longer need

---

## 🎯 Supported Form Fields

The extension automatically detects and fills:

- **Name fields**: first name, last name, full name
- **Contact information**: email, phone number
- **Address fields**: street address, city, state, ZIP code, country
- **Professional links**: LinkedIn, GitHub, portfolio, personal website
- **Work experience**: company names, job titles, descriptions
- **Education**: schools, degrees, fields of study
- **Skills**: skills text areas and input fields
- **Date fields**: birth dates, employment dates, graduation years
- **File uploads**: resume upload fields (automatically selects your stored resume)

---

## 🔒 Privacy & Security

- **100% Local**: All your data is stored locally in your browser using Chrome's secure storage APIs
- **No External Servers**: No data is sent to any external services or servers
- **Your Control**: You can export, import, or delete your data at any time
- **Secure Storage**: Uses Chrome's encrypted local storage
- **No Tracking**: The extension doesn't track your usage or collect analytics

---

## 📁 File Upload Feature

When forms have file upload fields for resumes:
- The extension detects resume upload fields automatically
- Your stored resume file will be ready for upload
- Supports PDF, DOC, and DOCX formats
- Files are stored securely as base64 data in local storage
- Drag and drop interface for easy file management

---

## 🛠️ Technical Details

### Extension Structure
```
extension/
├── manifest.json       # Extension configuration
├── popup.html         # Main popup interface
├── popup.js          # Popup functionality
├── options.html      # Settings page
├── options.js        # Settings functionality
└── icons/           # Extension icons
```

### Storage Format
Data is stored in Chrome's local storage as JSON objects:
```json
{
  "profiles": {
    "profile_123456": {
      "name": "Work Profile",
      "personal": { ... },
      "address": { ... },
      "documents": { ... },
      "links": { ... },
      "experience": [ ... ],
      "education": [ ... ],
      "skills": [ ... ],
      "emergencyContact": { ... }
    }
  }
}
```

---

## 🚀 Publishing to Chrome Web Store

1. Create a Chrome Web Store developer account (one-time $5 fee)
2. Zip the extension folder
3. Upload to the Chrome Web Store
4. Fill out the store listing with screenshots and description
5. Submit for review

---

## 🐞 Troubleshooting

### Extension Not Working
- Make sure you've loaded the extension in Developer Mode
- Check that you have at least one profile created
- Verify the website allows form filling (some sites block it)

### Forms Not Filling
- The extension uses intelligent field detection but may not catch all custom fields
- Try different field names or contact the developer for improvements
- Some websites use complex form structures that may not be supported

### File Upload Issues
- Make sure your resume file is in PDF, DOC, or DOCX format
- File size should be reasonable (under 10MB)
- Some websites may not support programmatic file selection

---

## 📦 Repository Structure

```
extension/
├── manifest.json     # Extension manifest
├── popup.html       # Main popup UI
├── popup.js         # Popup logic
├── options.html     # Settings page UI
├── options.js       # Settings page logic
└── icons/          # Extension icons
    ├── 16.png
    ├── 32.png
    ├── 48.png
    └── 128.png
```

---

## 📝 License

MIT License - feel free to modify and distribute as needed.
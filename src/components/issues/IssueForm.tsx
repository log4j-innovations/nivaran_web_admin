'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useToast } from '@/lib/toastContext';
import { firestoreService } from '@/lib/firebase';
import { LoadingSpinner } from '@/components/LoadingSpinner';

import { PriorityIndicator } from '@/components/ui/PriorityIndicator';
import {
  AlertTriangle,
  Camera,
  X,
  CheckCircle,
  Clock
} from 'lucide-react';

interface IssueFormData {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
  };
  area: string;
  tags?: string[];
  estimatedCost?: number | null;
  images?: File[]; // For form handling - will be converted to URLs when saving
}

const issueCategories = [
  { value: 'pothole', label: 'Pothole', icon: '🕳️', description: 'Road surface damage' },
  { value: 'street_light', label: 'Street Light Fault', icon: '💡', description: 'Lighting issues' },
  { value: 'water_leak', label: 'Water Leak / Pipe Burst', icon: '💧', description: 'Water infrastructure' },
  { value: 'traffic_signal', label: 'Traffic Signal Fault', icon: '🚦', description: 'Traffic control' },
  { value: 'sidewalk', label: 'Sidewalk / Footpath Damage', icon: '🚶', description: 'Pedestrian paths' },
  { value: 'drainage', label: 'Drainage / Clogging', icon: '🌊', description: 'Water drainage' },
  { value: 'debris', label: 'Debris / Fallen Tree', icon: '🌳', description: 'Obstacles on road' },
  { value: 'other', label: 'Other', icon: '📋', description: 'Other issues' }
];

const priorityLevels = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700', sla: '72-96 hours' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700', sla: '24-48 hours' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700', sla: '12-24 hours' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700', sla: '6-12 hours' }
];

const severityLevels = [
  { value: 'minor', label: 'Minor', description: 'Low impact, no immediate risk' },
  { value: 'moderate', label: 'Moderate', description: 'Moderate impact on traffic/safety' },
  { value: 'major', label: 'Major', description: 'Major impact on public safety' },
  { value: 'critical', label: 'Critical', description: 'Emergency, immediate risk to life/property' }
];

const areas = [
  { value: 'central_delhi', label: 'Central Delhi (New Delhi District)', priority: 'high' },
  { value: 'ghaziabad', label: 'Ghaziabad District (UP)', priority: 'high' },
  { value: 'gurgaon', label: 'Gurgaon District (Haryana)', priority: 'medium' },
  { value: 'faridabad', label: 'Faridabad District (Haryana)', priority: 'medium' },
  { value: 'rajkot_rmc', label: 'Rajkot Municipal Corporation (RMC)', priority: 'high' },
  { value: 'rajkot_ruda', label: 'Rajkot Urban Development Authority (RUDA)', priority: 'medium' },
  { value: 'gondal', label: 'Gondal', priority: 'medium' },
  { value: 'jetpur', label: 'Jetpur', priority: 'low' },
  { value: 'upleta', label: 'Upleta', priority: 'low' }
];

export default function IssueForm() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<IssueFormData>({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    severity: 'moderate',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    area: '',
    tags: [],
    estimatedCost: undefined,
    images: []
  });

  const [slaInfo, setSlaInfo] = useState<{
    targetHours: number;
    escalationHours: number;
    deadline: Date;
    isEscalated: boolean;
  } | null>(null);

  // Calculate SLA based on category and priority
  const calculateSLA = (category: string | undefined, priority: string | undefined) => {
    if (!category || !priority) return;
    const slaTable: Record<string, Record<string, { target: number; escalation: number }>> = {
      pothole: {
        low: { target: 72, escalation: 96 },
        medium: { target: 48, escalation: 60 },
        high: { target: 24, escalation: 36 },
        critical: { target: 12, escalation: 18 }
      },
      street_light: {
        low: { target: 96, escalation: 120 },
        medium: { target: 72, escalation: 84 },
        high: { target: 48, escalation: 60 },
        critical: { target: 24, escalation: 30 }
      },
      water_leak: {
        low: { target: 48, escalation: 60 },
        medium: { target: 24, escalation: 36 },
        high: { target: 12, escalation: 18 },
        critical: { target: 6, escalation: 12 }
      },
      traffic_signal: {
        low: { target: 48, escalation: 60 },
        medium: { target: 24, escalation: 30 },
        high: { target: 12, escalation: 18 },
        critical: { target: 6, escalation: 12 }
      },
      sidewalk: {
        low: { target: 72, escalation: 96 },
        medium: { target: 48, escalation: 60 },
        high: { target: 24, escalation: 36 },
        critical: { target: 12, escalation: 18 }
      },
      drainage: {
        low: { target: 48, escalation: 60 },
        medium: { target: 24, escalation: 36 },
        high: { target: 12, escalation: 18 },
        critical: { target: 6, escalation: 12 }
      },
      debris: {
        low: { target: 24, escalation: 36 },
        medium: { target: 12, escalation: 18 },
        high: { target: 6, escalation: 12 },
        critical: { target: 3, escalation: 6 }
      },
      other: {
        low: { target: 72, escalation: 96 },
        medium: { target: 48, escalation: 60 },
        high: { target: 24, escalation: 36 },
        critical: { target: 12, escalation: 18 }
      }
    };

    const sla = slaTable[category]?.[priority];
    if (sla) {
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + sla.target);
      
      setSlaInfo({
        targetHours: sla.target,
        escalationHours: sla.escalation,
        deadline,
        isEscalated: false
      });
    }
  };

  const handleInputChange = (field: string, value: string | number | undefined | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
          if (field === 'category' || field === 'priority') {
        calculateSLA(
          field === 'category' ? (typeof value === 'string' ? value : undefined) : formData.category,
          field === 'priority' ? (typeof value === 'string' ? value : undefined) : formData.priority
        );
      }
  };

  const handleLocationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...files] }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.title?.trim()) {
      toast.error('Validation Error', 'Title is required');
      return;
    }
    
    if (!formData.description?.trim()) {
      toast.error('Validation Error', 'Description is required');
      return;
    }
    
    if (!formData.category) {
      toast.error('Validation Error', 'Category is required');
      return;
    }
    
    if (!formData.priority) {
      toast.error('Validation Error', 'Priority is required');
      return;
    }
    
    if (!formData.area) {
      toast.error('Validation Error', 'Area is required');
      return;
    }
    
    if (!formData.location?.address?.trim()) {
      toast.error('Validation Error', 'Address is required');
      return;
    }
    
    setLoading(true);

    try {
      // Upload images to Firebase Storage first
      const imageUrls: string[] = [];
      if (formData.images && formData.images.length > 0) {
        setUploadingImages(true);
        try {
          console.log(`Starting upload of ${formData.images.length} images...`);
          
          // Upload each image and get download URLs
          for (let i = 0; i < formData.images.length; i++) {
            const image = formData.images[i];
            console.log(`Uploading image ${i + 1}/${formData.images.length}:`, image.name);
            
            try {
              const imageUrl = await uploadImageToStorage(image);
              imageUrls.push(imageUrl);
              console.log(`Successfully uploaded image ${i + 1}:`, imageUrl);
              
              // Show progress toast
              if (formData.images.length > 1) {
                toast.info('Upload Progress', `Uploaded ${i + 1} of ${formData.images.length} images`);
              }
            } catch (individualError) {
              console.error(`Failed to upload image ${i + 1}:`, individualError);
              toast.error('Image Upload Failed', `Failed to upload ${image.name}. Please try again.`);
              setLoading(false);
              setUploadingImages(false);
              return;
            }
          }
          
          console.log('All images uploaded successfully:', imageUrls);
        } catch (uploadError) {
          console.error('Error in image upload process:', uploadError);
          toast.error('Image Upload Failed', 'Failed to upload images. Please try again.');
          setLoading(false);
          setUploadingImages(false);
          return;
        } finally {
          setUploadingImages(false);
        }
      }

      // Clean up form data - ensure estimatedCost is null if undefined or empty
      const cleanFormData = { ...formData };
      if (cleanFormData.estimatedCost === undefined || cleanFormData.estimatedCost === null || cleanFormData.estimatedCost === 0) {
        cleanFormData.estimatedCost = null;
      }
      if (cleanFormData.tags && cleanFormData.tags.length === 0) {
        delete cleanFormData.tags;
      }

      // Remove the images field from cleanFormData since we'll add it separately
      delete cleanFormData.images;

      // Create issue in Firestore with image URLs instead of File objects
      const issueData = {
        ...cleanFormData,
        images: imageUrls, // Use URLs instead of File objects
        status: 'pending',
        reportedBy: user?.id || 'unknown',
        createdAt: new Date(),
        updatedAt: new Date(),
        slaDeadline: slaInfo?.deadline,
        slaTargetHours: slaInfo?.targetHours,
        slaEscalationHours: slaInfo?.escalationHours
      };

      // Ensure images is always an array (even if empty)
      if (!Array.isArray(issueData.images)) {
        issueData.images = [];
      }

      // Debug: Log the final issue data being sent to Firestore
      console.log('Final issue data for Firestore:', JSON.stringify(issueData, null, 2));

      // Additional safety check: Ensure no File objects exist in the data
      const hasFileObjects = Object.values(issueData).some((value: unknown) => 
        value instanceof File || (Array.isArray(value) && value.some((item: unknown) => item instanceof File))
      );
      
      if (hasFileObjects) {
        throw new Error('File objects detected in issue data. Cannot save to Firestore.');
      }

      const issueId = await firestoreService.createIssue(issueData);
      
      toast.success('Issue Created', `Issue "${formData.title}" has been successfully created with ID: ${issueId}`);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        severity: 'moderate',
        location: { address: '', city: '', state: '', zipCode: '' },
        area: '',
        tags: [],
        estimatedCost: undefined,
        images: []
      });
      setSlaInfo(null);
      setStep(1);
      
    } catch (error) {
      toast.error('Creation Failed', 'Failed to create issue. Please try again.');
      console.error('Error creating issue:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to upload image to Firebase Storage
  const uploadImageToStorage = async (file: File): Promise<string> => {
    try {
      console.log('Starting image upload for file:', file.name, 'Size:', file.size);
      
      // Validate file
      if (!file || file.size === 0) {
        throw new Error('Invalid file');
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size is 5MB.');
      }
      
      // Import storage service dynamically to avoid issues
      const { storageService } = await import('@/lib/firebase');
      
      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `issues/${timestamp}_${file.name}`;
      
      console.log('Uploading to path:', fileName);
      
      // Upload file to Firebase Storage
      const downloadUrl = await storageService.uploadFile(file, fileName);
      
      console.log('Upload successful, download URL:', downloadUrl);
      return downloadUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to upload image: ${error.message}`);
      }
      throw new Error('Failed to upload image');
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl p-6 text-white">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Report New Issue</h1>
            <p className="text-blue-100">Create a new municipal issue report</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                stepNumber <= step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div className={`w-16 h-1 mx-2 ${
                  stepNumber < step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Basic Info</span>
          <span>Details</span>
          <span>Location</span>
          <span>Review</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500 bg-white"
                placeholder="Brief description of the issue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500 bg-white"
                placeholder="Detailed description of the issue, including any safety concerns"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white"
                >
                  <option value="">Select Category</option>
                  {issueCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area *
                </label>
                <select
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white"
                >
                  <option value="">Select Area</option>
                  {areas.map((area) => (
                    <option key={area.value} value={area.value}>
                      {area.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Priority & Severity */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Priority & Severity Assessment</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Priority Level *
                </label>
                <div className="space-y-3">
                  {priorityLevels.map((priority) => (
                    <label key={priority.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value={priority.value}
                        checked={formData.priority === priority.value}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div className={`px-3 py-2 rounded-lg ${priority.color} flex-1`}>
                        <div className="font-medium">{priority.label}</div>
                        <div className="text-xs opacity-75">SLA: {priority.sla}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Severity Level *
                </label>
                <div className="space-y-3">
                  {severityLevels.map((severity) => (
                    <label key={severity.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="severity"
                        value={severity.value}
                        checked={formData.severity === severity.value}
                        onChange={(e) => handleInputChange('severity', e.target.value)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="px-3 py-2 rounded-lg bg-gray-50 flex-1">
                        <div className="font-medium">{severity.label}</div>
                        <div className="text-xs text-gray-600">{severity.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* SLA Information */}
            {slaInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">SLA Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Target:</span>
                    <div className="text-blue-900">{slaInfo.targetHours} hours</div>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Escalation:</span>
                    <div className="text-blue-900">{slaInfo.escalationHours} hours</div>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Deadline:</span>
                    <div className="text-blue-900">
                      {slaInfo.deadline.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Location & Additional Details */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Location & Additional Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => handleLocationChange('address', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="Street address or landmark"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.location.city}
                  onChange={(e) => handleLocationChange('city', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="City name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.location.state}
                  onChange={(e) => handleLocationChange('state', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="State name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={formData.location.zipCode}
                  onChange={(e) => handleLocationChange('zipCode', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="ZIP/Postal code"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Cost (Optional)
              </label>
              <input
                type="number"
                value={formData.estimatedCost || ''}
                onChange={(e) => handleInputChange('estimatedCost', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500 bg-white"
                placeholder="Estimated repair cost in USD"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <div className="text-gray-600">
                    <span className="font-medium">Click to upload</span> or drag and drop
                  </div>
                  <div className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</div>
                </label>
              </div>
              
              {/* Image Preview */}
              {formData.images && formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Review & Submit</h2>
            
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Issue Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Title:</span> {formData.title}</div>
                    <div><span className="font-medium">Category:</span> {formData.category}</div>
                    <div><span className="font-medium">Priority:</span> 
                      <PriorityIndicator priority={formData.priority} variant="badge" size="sm" />
                    </div>
                    <div><span className="font-medium">Severity:</span> {formData.severity}</div>
                    <div><span className="font-medium">Area:</span> {formData.area}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Address:</span> {formData.location.address}</div>
                    <div><span className="font-medium">City:</span> {formData.location.city}</div>
                    <div><span className="font-medium">State:</span> {formData.location.state}</div>
                    <div><span className="font-medium">ZIP:</span> {formData.location.zipCode}</div>
                  </div>
                </div>
              </div>

              {slaInfo && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">SLA Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-blue-700 font-medium">Target Time</div>
                      <div className="text-blue-900 font-semibold">{slaInfo.targetHours} hours</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-yellow-700 font-medium">Escalation Time</div>
                      <div className="text-yellow-900 font-semibold">{slaInfo.escalationHours} hours</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-green-700 font-medium">Deadline</div>
                      <div className="text-green-900 font-semibold">
                        {slaInfo.deadline.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {formData.images && formData.images.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Photos ({formData.images?.length || 0})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1}
            className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex space-x-3">
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!formData.title || !formData.category || !formData.area}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || uploadingImages}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Creating Issue...</span>
                  </>
                ) : uploadingImages ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Uploading Images...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Create Issue</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Pageheader from '@/shared/layout-components/page-header/pageheader';
import Seo from '@/shared/layout-components/seo/seo';
import Image from 'next/image';
import { toast, Toaster } from 'react-hot-toast';
import { API_BASE_URL } from '@/shared/data/utilities/api';

interface ProcessStep {
  stepTitle: string;
  stepDescription: string;
  duration: number;
}

interface ProcessFormData {
  name: string;
  description: string;
  type: string;
  sortOrder: number;
  image: File | null;
  status: 'active' | 'inactive';
  steps: ProcessStep[];
}

const AddProcessPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<ProcessFormData>({
    name: '',
    description: '',
    type: '',
    sortOrder: 0,
    image: null,
    status: 'active',
    steps: [{ stepTitle: '', stepDescription: '', duration: 0 }]
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sortOrder' ? parseInt(value) || 0 : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleStepChange = (index: number, field: keyof ProcessStep, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: field === 'duration' ? parseInt(value) || 0 : value
    };
    setFormData(prev => ({
      ...prev,
      steps: newSteps
    }));
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { stepTitle: '', stepDescription: '', duration: 0 }]
    }));
  };

  const removeStep = (index: number) => {
    if (formData.steps.length > 1) {
      const newSteps = formData.steps.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        steps: newSteps
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading('Creating process...');

    try {
      // First, create the process
      const processData = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        sortOrder: formData.sortOrder,
        status: formData.status,
        steps: formData.steps
      };

      const response = await fetch(`${API_BASE_URL}/processes`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create process');
      }

      const result = await response.json();

      // If there's an image, upload it
      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append('image', formData.image);

        const imageResponse = await fetch(`${API_BASE_URL}/processes/${result.id}/image`, {
          method: 'PATCH',
          body: imageFormData,
        });

        if (!imageResponse.ok) {
          toast.error('Process created but failed to upload image');
        }
      }

      toast.success('Process created successfully', { id: loadingToast });
      setTimeout(() => router.push('/catalog/processes'), 800);
    } catch (error) {
      console.error('Error creating process:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create process', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      <Seo title="Add Process" />
      <Pageheader currentpage="Add Process" activepage="Processes" mainpage="Add Process" />
      
      <div className="grid grid-cols-12 gap-6">
        <div className="xl:col-span-12 col-span-12">
          <div className="box">
            <div className="box-header">
              <h5 className="box-title">Add New Process</h5>
            </div>
            <div className="box-body">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-6">
                      <div className="form-group">
                        <label htmlFor="name" className="form-label required">Process Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          className="form-control"
                          placeholder="Enter process name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <div className="form-group">
                        <label htmlFor="type" className="form-label required">Process Type</label>
                        <select
                          id="type"
                          name="type"
                          className="form-select"
                          value={formData.type}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmitting}
                        >
                          <option value="">Select Type</option>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="Assembly">Assembly</option>
                          <option value="Quality Control">Quality Control</option>
                          <option value="Packaging">Packaging</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-span-12">
                      <div className="form-group">
                        <label htmlFor="description" className="form-label">Description</label>
                        <textarea
                          id="description"
                          name="description"
                          className="form-control"
                          placeholder="Enter process description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={4}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <div className="form-group">
                        <label htmlFor="sortOrder" className="form-label">Sort Order</label>
                        <input
                          type="number"
                          id="sortOrder"
                          name="sortOrder"
                          className="form-control"
                          placeholder="Enter sort order"
                          value={formData.sortOrder}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <div className="form-group">
                        <label htmlFor="status" className="form-label">Status</label>
                        <select
                          id="status"
                          name="status"
                          className="form-select"
                          value={formData.status}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-span-12">
                      <div className="form-group">
                        <label className="form-label">Process Image</label>
                        <div className="flex items-center space-x-4">
                          <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative">
                            {imagePreview ? (
                              <div className="relative w-full h-full">
                                <Image
                                  src={imagePreview}
                                  alt="Preview"
                                  fill
                                  className="object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, image: null }));
                                    setImagePreview('');
                                  }}
                                  disabled={isSubmitting}
                                >
                                  <i className="ri-close-line"></i>
                                </button>
                              </div>
                            ) : (
                              <div className="text-center">
                                <i className="ri-upload-2-line text-4xl text-gray-400"></i>
                                <p className="text-sm text-gray-500 mt-2">Upload Image</p>
                              </div>
                            )}
                            <input
                              type="file"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={handleImageChange}
                              accept="image/*"
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Process Steps */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h6 className="text-base font-semibold">Process Steps</h6>
                      <button
                        type="button"
                        className="ti-btn ti-btn-primary"
                        onClick={addStep}
                        disabled={isSubmitting}
                      >
                        <i className="ri-add-line me-2"></i>Add Step
                      </button>
                    </div>

                    {formData.steps.map((step, index) => (
                      <div key={index} className="grid grid-cols-12 gap-4 p-4 border rounded-lg relative">
                        <div className="col-span-12 md:col-span-4">
                          <div className="form-group">
                            <label className="form-label required">Step Title</label>
                            <input
                              type="text"
                              className="form-control"
                              value={step.stepTitle}
                              onChange={(e) => handleStepChange(index, 'stepTitle', e.target.value)}
                              required
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>

                        <div className="col-span-12 md:col-span-6">
                          <div className="form-group">
                            <label className="form-label required">Step Description</label>
                            <input
                              type="text"
                              className="form-control"
                              value={step.stepDescription}
                              onChange={(e) => handleStepChange(index, 'stepDescription', e.target.value)}
                              required
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>

                        <div className="col-span-12 md:col-span-2">
                          <div className="form-group">
                            <label className="form-label required">Duration (min)</label>
                            <input
                              type="number"
                              className="form-control"
                              value={step.duration}
                              onChange={(e) => handleStepChange(index, 'duration', e.target.value)}
                              required
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>

                        {formData.steps.length > 1 && (
                          <button
                            type="button"
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            onClick={() => removeStep(index)}
                            disabled={isSubmitting}
                          >
                            <i className="ri-delete-bin-line text-lg"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      type="button"
                      className="ti-btn ti-btn-secondary"
                      onClick={() => router.push('/catalog/processes')}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="ti-btn ti-btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin inline-block h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                          Creating...
                        </>
                      ) : (
                        'Create Process'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProcessPage;

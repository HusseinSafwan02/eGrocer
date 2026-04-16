import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// Defined outside Register so React doesn't treat it as a new component type on every render
function Field({ name, label, type = 'text', placeholder, required = false, form, errors, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={onChange}
        className={`input-field ${errors[name] ? 'border-red-400 focus:ring-red-400' : ''}`}
        placeholder={placeholder}
        autoComplete={type === 'password' ? 'new-password' : undefined}
      />
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const { fetchCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(form.password)) newErrors.password = 'Password must include an uppercase letter';
    if (!/[0-9]/.test(form.password)) newErrors.password = 'Password must include a digit';
    if (!/[^A-Za-z0-9]/.test(form.password)) newErrors.password = 'Password must include a special character';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setServerError('');
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        password: form.password,
      });
      await fetchCart();
      navigate('/', { replace: true });
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const mapped = {};
        apiErrors.forEach((e) => { mapped[e.path] = e.msg; });
        setErrors(mapped);
      } else {
        setServerError(err.response?.data?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <span className="text-4xl">🛒</span>
            <h1 className="text-2xl font-bold text-gray-800 mt-3">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">Join eGROCERY and start shopping</p>
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field name="name" label="Full Name" placeholder="Jane Doe" required form={form} errors={errors} onChange={handleChange} />
            <Field name="email" label="Email Address" type="email" placeholder="you@example.com" required form={form} errors={errors} onChange={handleChange} />
            <Field name="phone" label="Mobile Number" placeholder="+65 9123 4567" form={form} errors={errors} onChange={handleChange} />
            <Field name="address" label="Delivery Address" placeholder="10 Orchard Road, Singapore 238888" form={form} errors={errors} onChange={handleChange} />
            <Field name="password" label="Password" type="password" placeholder="Min 8 chars, 1 uppercase, 1 digit, 1 special" required form={form} errors={errors} onChange={handleChange} />
            <Field name="confirmPassword" label="Confirm Password" type="password" placeholder="Repeat your password" required form={form} errors={errors} onChange={handleChange} />

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              By registering, you agree to our Terms of Service and Privacy Policy, and consent to data collection in accordance with the PDPA.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

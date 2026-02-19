import { useForm } from '@inertiajs/react';

export default function TwoFactor() {

    const { data, setData, post, errors } = useForm({
        otp: ''
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('2fa.verify'));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-center">
                    Verificación 2FA
                </h2>

                <form onSubmit={submit}>
                    <input
                        type="text"
                        value={data.otp}
                        onChange={(e) => setData('otp', e.target.value)}
                        className="w-full border rounded p-2 mb-4"
                        placeholder="Ingresa el código"
                    />

                    {errors.otp && (
                        <div className="text-red-500 text-sm mb-2">
                            {errors.otp}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                    >
                        Verificar
                    </button>
                </form>
            </div>
        </div>
    );
}

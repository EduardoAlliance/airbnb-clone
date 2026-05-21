import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import products from '@/routes/products';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form } from "@inertiajs/react";
import { Spinner } from '@/components/ui/spinner';
import InputError from '@/components/input-error';

interface Props {
    texto?: string
}


export default function Create({ texto }: Props) {
    return (
        <div>
            <Head title='Create a new product' />
            <div className='mt-4 p-4'>
                <Form action={products.store().url} method='POST'>
                    {({ processing, errors }) => (
                        <>
                            <div className='grid grid-cols-1 gap-4 gap-x-6 w-8/12'>
                                <div>
                                    <Label htmlFor='price'>Name</Label>
                                    <Input className='mt-2' name='name' placeholder='Name'></Input>
                                     <InputError message={errors.name} />
                                </div>
                                <div>
                                    <Label htmlFor='price'>Price</Label>
                                    <Input className='mt-2' name='price' placeholder='Price'></Input>
                                     <InputError message={errors.price} />
                                </div>
                                <div>
                                    <Label htmlFor=''>Product Description</Label>
                                    <Textarea rows={10} name='description' className='mt-2' placeholder='Description'></Textarea>
                                     <InputError message={errors.description} />
                                </div>
                                <div>
                                    <Button type='submit'  disabled={processing}>
                                        {processing && <Spinner />}
                                        Add Product</Button>
                                </div>
                            </div>
                        </>
                    )}

                </Form>
            </div>
        </div>
    )
}

Create.layout = {
    breadcrumbs: [
        {
            title: 'Products',
            href: '/products',
        },
        {
            title: 'Create',
            href: '/products/create',
        },
    ],
};

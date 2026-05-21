import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import products from '@/routes/products';

interface Props  {
    texto?:string
}


export default function Index( {texto} : Props)  {
  return (
    <div>
        <Head title='Products'/>
        <div className='mt-4'>
            <Link href={ products.create().url }>
                <Button>Create Product</Button>
            </Link>
        </div>
    </div>
  )
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Products',
            href: '/products',
        },
    ],
};

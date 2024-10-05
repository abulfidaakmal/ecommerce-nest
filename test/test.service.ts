import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';
import * as bcrypt from 'bcrypt';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class TestService {
  constructor(
    private prismaService: PrismaService,
    private elasticsearchService: ElasticsearchService,
  ) {}

  private index = 'ecommerce_products_nest';

  async removeAllUser() {
    await this.prismaService.user.deleteMany({
      where: {
        first_name: 'test',
      },
    });
  }

  async createUser() {
    await this.prismaService.user.create({
      data: {
        username: 'test',
        first_name: 'test',
        last_name: 'test',
        email: 'test@gmail.com',
        phone: '092019101',
        password: await bcrypt.hash('test', 10),
        gender: 'MALE',
        avatar: 'test',
        birth_of_date: '2006-06-09T00:00:00.000Z',
      },
    });
  }

  async removeAllAddress() {
    await this.prismaService.address.deleteMany({
      where: {
        username: 'test',
      },
    });
  }

  async createAddress() {
    await this.prismaService.address.create({
      data: {
        street: 'test',
        city: 'test',
        province: 'test',
        postal_code: 'test',
        detail: 'test',
        name: 'test',
        phone: 'test',
        username: 'test',
      },
    });
  }

  async getAddressId() {
    const address = await this.prismaService.address.findFirst({
      where: { username: 'test' },
      select: { id: true },
    });

    return address.id;
  }

  async selectAddress(address_id: number) {
    await this.prismaService.address.update({
      where: {
        username: 'test',
        id: address_id,
      },
      data: {
        is_selected: true,
      },
    });
  }

  async getAddressSelected() {
    const address = await this.prismaService.address.findFirst({
      where: { username: 'test', is_selected: true },
      select: { id: true },
    });

    return address.id;
  }

  async removeAllSeller() {
    await this.prismaService.seller.deleteMany({
      where: { username: 'test' },
    });
  }

  async createSeller() {
    const addressId = await this.getAddressId();

    await this.prismaService.seller.create({
      data: {
        username: 'test',
        name: 'test',
        description: 'test',
        address_id: addressId,
      },
    });
  }

  async getUserRole() {
    return this.prismaService.user.findFirst({
      where: { username: 'test' },
      select: {
        role: true,
        has_been_seller: true,
      },
    });
  }

  async updateUserToSellerRole() {
    await this.prismaService.user.update({
      where: { username: 'test' },
      data: {
        role: 'SELLER',
        has_been_seller: true,
      },
    });
  }

  async updateUserToAdminRole() {
    await this.prismaService.user.update({
      where: { username: 'test' },
      data: {
        role: 'ADMIN',
        has_been_seller: true,
      },
    });
  }

  async deactivateSeller() {
    await this.prismaService.seller.update({
      where: { username: 'test' },
      data: { isDeleted: true },
    });
  }

  async removeAllCategory() {
    await this.prismaService.category.deleteMany({
      where: { username: 'test' },
    });
  }

  async createCategory() {
    await this.prismaService.category.create({
      data: {
        username: 'test',
        name: 'test',
      },
    });
  }

  async getCategoryId() {
    const category = await this.prismaService.category.findFirst({
      select: { id: true },
    });

    return category.id;
  }

  async removeAllProduct() {
    await this.prismaService.$transaction(async (prisma) => {
      await prisma.product.deleteMany({
        where: {
          username: 'test',
        },
      });

      await this.elasticsearchService.deleteByQuery({
        index: this.index,
        query: {
          match: {
            description: 'this is an example of a field description',
          },
        },
      });

      await this.elasticsearchService.indices.refresh({
        index: this.index,
      });
    });
  }

  async getProductFromElastic() {
    await this.elasticsearchService.indices.refresh({
      index: this.index,
    });

    const product = await this.elasticsearchService.search({
      index: this.index,
      query: {
        match: {
          description: 'this is an example of a field description',
        },
      },
    });

    return product.hits.hits.map((hit) => hit._source)[0];
  }

  async createProductWithoutElastic() {
    const categoryId = await this.getCategoryId();

    await this.prismaService.product.create({
      data: {
        name: 'test123',
        description: 'this is an example of a field description',
        price: 1000,
        stock: 1,
        category_id: categoryId,
        weight: 1000,
        condition: 'NEW',
        sku: 'test',
        image_url: 'test',
        username: 'test',
      },
    });
  }

  async getProductId() {
    const product = await this.prismaService.product.findFirst({
      select: { id: true },
    });

    return product.id;
  }

  async createProduct() {
    const categoryId = await this.getCategoryId();

    await this.prismaService.$transaction(async (prisma) => {
      const product = await prisma.product.create({
        data: {
          name: 'test',
          description: 'this is an example of a field description',
          price: 1000,
          stock: 1,
          category_id: categoryId,
          weight: 1000,
          condition: 'NEW',
          sku: 'test',
          image_url: 'test',
          username: 'test',
        },
      });

      await this.elasticsearchService.index({
        index: this.index,
        id: product.id.toString(),
        document: {
          name: product.name,
          description: product.description,
          price: product.price,
          image_url: product.image_url,
          isDeleted: false,
        },
      });

      await this.elasticsearchService.indices.refresh({
        index: this.index,
      });
    });
  }

  async checkProductStatus() {
    const product = await this.prismaService.product.findFirst({
      where: { username: 'test' },
      select: { isDeleted: true },
    });

    return product.isDeleted;
  }

  async removeAllWishlist() {
    await this.prismaService.wishlist.deleteMany({
      where: { username: 'test' },
    });
  }

  async removeAllProductWithoutElastic() {
    await this.prismaService.product.deleteMany({
      where: { username: 'test' },
    });
  }

  async createWishlist() {
    const productId = await this.getProductId();

    await this.prismaService.wishlist.create({
      data: {
        username: 'test',
        product_id: productId,
      },
    });
  }

  async getWishlistId() {
    const wishlist = await this.prismaService.wishlist.findFirst({
      where: { username: 'test' },
    });

    return wishlist.id;
  }

  async getCart() {
    return this.prismaService.cart.findFirst({
      where: { username: 'test' },
      select: {
        quantity: true,
        total: true,
      },
    });
  }

  async createCart() {
    const productId = await this.getProductId();

    await this.prismaService.cart.create({
      data: {
        username: 'test',
        product_id: productId,
        quantity: 1,
        total: 1000,
      },
    });
  }

  async removeAllCart() {
    await this.prismaService.cart.deleteMany({
      where: { username: 'test' },
    });
  }
}

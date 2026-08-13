// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        console.log("👉 Tentando login para:", credentials?.email);
        
        try {
          // CORREÇÃO SÊNIOR: Usar 127.0.0.1 evita falhas de resolução de rede (IPv6 vs IPv4)
          const res = await fetch("http://127.0.0.1:5000/api/login", {
            method: 'POST',
            body: JSON.stringify({
              email: credentials?.email,
              senha: credentials?.senha
            }),
            headers: { "Content-Type": "application/json" }
          });

          console.log("👉 Status retornado pelo Backend:", res.status);
          const user = await res.json();

          if (res.ok && user) {
            console.log("✅ Login aprovado pelo banco de dados!");
            return user;
          }
          
          console.log("❌ Credenciais recusadas pelo Backend.");
          return null;
        } catch (error) {
          console.error("🚨 FALHA CRÍTICA: Não foi possível conectar ao Backend Node.js.");
          console.error("Verifique se o terminal do backend está rodando em npm run dev na porta 5000!");
          return null;
        }
      }
    })
  ],
  // (apenas o trecho dos callbacks do NextAuth)
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.empresa = (user as any).empresa; // Captura a empresa
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
        (session.user as any).empresa = token.empresa; // Joga pra sessão
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // Mantém o usuário na nossa tela de login em caso de erro
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CompleteProviderSignUp() {
    const router = useRouter();
    const [companyName, setCompanyName] = useState("");
    const [category, setCategory] = useState("");
    const [region, setRegion] = useState("");
    const [isLoading, setIsLoading] = useState(false); 
    const [error, setError] = useState<string | null>(null); 

    const submitForm = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Validation
            if (!companyName || !category || !region) {
                throw new Error("Please fill in all fields");
            }

            // Get current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError) throw userError;
            if (!user) throw new Error("No user found");

            // Save to Supabase
            const { error: insertError } = await supabase
                .from('providers')
                .insert([
                    {
                        user_id: user.id,
                        company_name: companyName,
                        category: category,
                        region: region,
                    }
                ]);

            if (insertError) throw insertError;

            // Navigate to dashboard on success
            router.push("/dashboard");
            
        } catch (err) {
            setError(err.message);
            Alert.alert("Error", err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Complete Your Profile</Text>
                
                <TextInput
                    style={styles.input}
                    placeholder="Company Name"
                    value={companyName}
                    onChangeText={setCompanyName}
                />
                
                <TextInput
                    style={styles.input}
                    placeholder="Category (e.g., Plumbing, Electrical)"
                    value={category}
                    onChangeText={setCategory}
                />
                
                <TextInput
                    style={styles.input}
                    placeholder="Region"
                    value={region}
                    onChangeText={setRegion}
                />
                
                {error && <Text style={styles.errorText}>{error}</Text>}
                
                <TouchableOpacity 
                    style={styles.submitButton}
                    onPress={submitForm}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Complete Sign Up</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    formContainer: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    submitButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
}); 
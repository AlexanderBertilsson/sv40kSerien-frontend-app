import { View, Text, TextInput, StyleSheet, Pressable, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuthContext } from '@/src/contexts/AuthContext';
import { useColorScheme } from 'react-native';
import { Colors } from '@/src/constants/Colors';
import { useRouter } from 'expo-router';
import apiClient from '@/src/components/httpClient/httpClient';
import ImageDropZone from '@/src/components/ImageDropZone';

export default function CreateTeamScreen() {
    const [teamName, setTeamName] = useState('');
    const [logoUri, setLogoUri] = useState<string | null>(null);
    const [bannerUri, setBannerUri] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const { profile, refreshProfile } = useAuthContext();
    const colorScheme = useColorScheme() ?? 'dark';
    const theme = Colors[colorScheme];
    const router = useRouter();

    // Route guard: redirect if user already has a team
    useEffect(() => {
        if (profile?.teamId) {
            router.replace(`/team/${profile.teamId}`);
        }
    }, [profile?.teamId, router]);

    const uploadToS3 = async (signedUrl: string, imageUri: string) => {
        try {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            
            const uploadResponse = await fetch(signedUrl, {
                method: 'PUT',
                body: blob,
                headers: {
                    'Content-Type': blob.type,
                },
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload to S3');
            }
        } catch (error) {
            console.error('Error uploading to S3:', error);
            throw error;
        }
    };

    const getImageMetadata = (uri: string) => {
        // Check if it's a data URL (base64)
        if (uri.startsWith('data:')) {
            const match = uri.match(/^data:image\/(\w+);base64,/);
            if (match) {
                const format = match[1];
                return {
                    extension: format,
                    contentType: `image/${format}`,
                };
            }
        }
        
        // Fallback: try to extract from file extension
        const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
        return {
            extension,
            contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
        };
    };

    const handleCreateTeam = async () => {
        if (!teamName.trim()) {
            Alert.alert('Error', 'Please enter a team name');
            return;
        }

        setIsCreating(true);
        try {
            // Prepare image metadata for backend
            const imageMetadata: any = {};
            
            if (logoUri) {
                const { extension, contentType } = getImageMetadata(logoUri);
                imageMetadata.logo = {
                    fileName: `team-logo-${Date.now()}.${extension}`,
                    contentType,
                };
            }

            if (bannerUri) {
                const { extension, contentType } = getImageMetadata(bannerUri);
                imageMetadata.banner = {
                    fileName: `team-banner-${Date.now()}.${extension}`,
                    contentType,
                };
            }

            // Create team and get signed URLs
            const response = await apiClient.post('/teams', {
                name: teamName,
                images: imageMetadata,
            });

            if (response.status === 200 || response.status === 201) {
                const newTeam = response.data;
                
                // Upload images to S3 if signed URLs are provided
                const uploadPromises: Promise<void>[] = [];

                if (newTeam.logoSignedUrl && logoUri) {
                    uploadPromises.push(uploadToS3(newTeam.logoSignedUrl, logoUri));
                }

                if (newTeam.bannerSignedUrl && bannerUri) {
                    uploadPromises.push(uploadToS3(newTeam.bannerSignedUrl, bannerUri));
                }

                // Wait for all uploads to complete
                if (uploadPromises.length > 0) {
                    await Promise.all(uploadPromises);
                }
                
                // Refresh profile to get updated teamId
                await refreshProfile();
                
                Alert.alert('Success', 'Team created successfully!');
                
                // Navigate to the new team page
                router.replace(`/team/${newTeam.id}`);
            }
        } catch (error) {
            console.error('Failed to create team:', error);
            Alert.alert('Error', 'Failed to create team. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    // Don't render if user already has a team (route guard)
    if (profile?.teamId) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.tint} />
            </View>
        );
    }

    return (
        <ScrollView style={[styles.scrollContainer, { backgroundColor: theme.background }]}>
            <View style={styles.container}>
                <Text style={[styles.title, { color: theme.text }]}>Create Your Team</Text>
                
                <TextInput
                    style={[styles.input, { 
                        backgroundColor: theme.secondary, 
                        color: theme.text,
                        borderColor: theme.tint 
                    }]}
                    placeholder="Team Name"
                    placeholderTextColor={theme.text + '80'}
                    value={teamName}
                    onChangeText={setTeamName}
                    editable={!isCreating}
                />

                {/* Team Logo Picker */}
                <ImageDropZone
                    imageUri={logoUri}
                    onImageSelected={setLogoUri}
                    onImageRemoved={() => setLogoUri(null)}
                    label="Team Logo"
                    aspectRatio={[1, 1]}
                    width={150}
                    height={150}
                    disabled={isCreating}
                    theme={theme}
                />

                {/* Team Banner Picker */}
                <ImageDropZone
                    imageUri={bannerUri}
                    onImageSelected={setBannerUri}
                    onImageRemoved={() => setBannerUri(null)}
                    label="Team Banner"
                    aspectRatio={[16, 9]}
                    width="100%"
                    height={150}
                    disabled={isCreating}
                    theme={theme}
                />

                <Pressable
                    style={[styles.button, { 
                        backgroundColor: isCreating ? theme.secondary : theme.tint,
                        opacity: isCreating ? 0.5 : 1
                    }]}
                    onPress={handleCreateTeam}
                    disabled={isCreating}
                >
                    {isCreating ? (
                        <ActivityIndicator color={theme.background} />
                    ) : (
                        <Text style={[styles.buttonText, { color: theme.background }]}>
                            Create Team
                        </Text>
                    )}
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
    },
    container: {
        padding: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});